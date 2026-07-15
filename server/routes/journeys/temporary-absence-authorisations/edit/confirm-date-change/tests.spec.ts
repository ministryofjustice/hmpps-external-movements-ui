import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubPutTapAuthorisation,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationConfirmDateChangePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'

test.describe('/temporary-absence-authorisations/edit/confirm-date-change unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/confirm-date-change`)
  })
})

test.describe('/temporary-absence-authorisations/edit/confirm-date-change', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      cellLocation: '2-1-005',
    },
    repeat: true,
    start: '2001-01-02',
    locations: [
      { uprn: 1001, description: 'Random Street, UK' },
      { uprn: 1002, description: 'Another Street, UK' },
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
            changes: [{ propertyName: 'start', previous: '2025-12-02', change: '2025-12-01' }],
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
    await injectJourneyData(page, journeyId, {
      updateTapAuthorisation: {
        authorisation,
        backUrl: 'back-url',
        start: '2001-01-01',
        end: '2001-01-06',
        newOccurrences: [
          { start: '2001-01-05T10:00:00', end: '2001-01-05T17:30:00' },
          { start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' },
        ],
      },
    })
    await page.goto(`/${journeyId}/temporary-absence-authorisations/edit/confirm-date-change`)
  }

  test('should confirm TAP date change and proceed to select location', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmDateChangePage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.continueButton()).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if you want to change the dates').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/select-location/)
  })
})
