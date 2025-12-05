import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { CancelTapOccurrencePage } from './test.page'

test.describe('/temporary-absences/edit/cancel', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()
  const occurrenceId = uuidV4()

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
    repeat: true,
    fromDate: '2001-01-01',
    toDate: '2001-01-01',
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id',
        status: { code: 'PENDING', description: 'To be reviewed' },
        releaseAt: '2001-01-01T10:00:00',
        returnBy: '2001-01-01T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  const occurrence = {
    id: occurrenceId,
    authorisation,
    status: { code: 'SCHEDULED', description: 'Scheduled' },
    releaseAt: '2001-01-01T10:00:00',
    returnBy: '2001-01-01T17:30:00',
    location: { uprn: 1001, description: 'Random Street, UK' },
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubGetTapOccurrence(occurrence),
      stubPutTapOccurrence(occurrenceId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.temporary-absence.cancelled'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/cancel`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new CancelTapOccurrencePage(page).verifyContent()

    await expect(testPage.reasonField()).toBeVisible()
    await expect(testPage.reasonField()).toHaveValue('')
    await expect(testPage.button('Cancel this absence', true)).toBeVisible()
    await expect(testPage.button('Do not cancel this absence')).toBeVisible()
    await expect(testPage.button('Do not cancel this absence')).toHaveAttribute(
      'href',
      /\/temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )

    // verify validation error
    await testPage.clickButton('Cancel this absence', 0)
    await testPage.link('Enter a reason').click()
    await expect(testPage.reasonField()).toBeFocused()

    // verify next page routing
    await testPage.reasonField().fill(`test`)
    await testPage.clickButton('Cancel this absence', 0)

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)
  })
})
