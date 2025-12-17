import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import {
  randomPrisonNumber,
  testTapAuthorisation,
  testTapOccurrence,
} from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapOccurrenceTransportPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absences/edit/transport', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absences/edit/transport`)
  })
})

test.describe('/temporary-absences/edit/transport', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()
  const occurrenceId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    repeat: true,
    start: '2001-01-02',
    end: '2001-01-05',
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'PENDING', description: 'To be reviewed' },
        start: '2001-01-02T10:00:00',
        end: '2001-01-02T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  const occurrence = {
    ...testTapOccurrence,
    id: occurrenceId,
    authorisation,
    status: { code: 'SCHEDULED', description: 'Scheduled' },
    start: '2001-01-03T10:00:00',
    end: '2001-01-03T17:30:00',
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
            domainEvents: ['person.temporary-absence.rescheduled'],
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
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/transport`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceTransportPage(page).verifyContent()

    await expect(testPage.transportTypeRadio()).toBeVisible()
    await expect(testPage.transportTypeRadio()).not.toBeChecked()
    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify next page routing
    await testPage.transportTypeRadio().click()
    await testPage.clickButton('Confirm and save')

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)
  })
})
