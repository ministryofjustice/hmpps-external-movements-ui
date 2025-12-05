import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubPutTapAuthorisation,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationStartEndDatesPage } from './test.page'

test.describe('/temporary-absence-authorisations/edit/start-end-dates', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: { code: 'PENDING', description: 'To be reviewed' },
    absenceType: {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
    },
    absenceSubType: {
      code: 'RDR',
      description: 'RDR (Resettlement Day Release)',
      hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
    },
    absenceReasonCategory: { code: 'PW', description: 'Paid work' },
    absenceReason: { code: 'R15', description: 'IT and communication' },
    repeat: true,
    fromDate: '2001-01-02',
    toDate: '2001-01-05',
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'PENDING', description: 'To be reviewed' },
        releaseAt: '2001-01-02T10:00:00',
        returnBy: '2001-01-02T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
      {
        id: 'occurrence-id-2',
        status: { code: 'PENDING', description: 'To be reviewed' },
        releaseAt: '2001-01-05T10:00:00',
        returnBy: '2001-01-05T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubPutTapAuthorisation(authorisationId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.temporary-absence-authorisation.date-range-changed'],
            changes: [{ propertyName: 'fromDate', previous: '2025-12-02', change: '2025-12-01' }],
          },
        ],
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/start-end-dates`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapAuthorisationStartEndDatesPage(page).verifyContent()

    await expect(testPage.fromDateField()).toBeVisible()
    await expect(testPage.fromDateField()).toHaveValue('2/1/2001')
    await expect(testPage.toDateField()).toBeVisible()
    await expect(testPage.toDateField()).toHaveValue('5/1/2001')
    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify validation error
    await testPage.fromDateField().clear()
    await testPage.toDateField().clear()
    await testPage.clickButton('Confirm and save')
    await testPage.link('Enter or select a start date').click()
    await expect(testPage.fromDateField()).toBeFocused()
    await testPage.link('Enter or select a return date').click()
    await expect(testPage.toDateField()).toBeFocused()

    await testPage.fromDateField().fill('3/1/2001')
    await testPage.toDateField().fill('x')
    await testPage.clickButton('Confirm and save')

    await testPage.link('The start date must be on or before the first occurrence 2/1/2001').click()
    await expect(testPage.fromDateField()).toBeFocused()
    await testPage.link('Enter or select a valid return date').click()
    await expect(testPage.toDateField()).toBeFocused()

    await testPage.fromDateField().fill(`1/1/2001`)
    await testPage.toDateField().fill(`1/1/2002`)
    await testPage.clickButton('Confirm and save')

    await testPage.link('Absence period can only extend to 6 months from the entry date').click()
    await expect(testPage.toDateField()).toBeFocused()

    // verify next page routing
    await testPage.fromDateField().fill(`1/1/2001`)
    await testPage.toDateField().fill(`12/1/2001`)
    await testPage.clickButton('Confirm and save')

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)
  })
})
