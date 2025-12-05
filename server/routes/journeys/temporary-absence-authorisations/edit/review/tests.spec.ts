import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { ReviewTapAuthorisationPage } from './test.page'

test.describe('/temporary-absence-authorisations/edit/review', () => {
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
    status: { code: 'APPROVED', description: 'approved' },
    absenceType: {
      code: 'PP',
      description: 'Police production',
    },
    repeat: false,
    fromDate: '2001-01-02',
    toDate: '2001-01-05',
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'SCHEDULED', description: 'Scheduled' },
        releaseAt: '2001-01-02T10:00:00',
        returnBy: '2001-01-02T17:30:00',
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
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/review`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ReviewTapAuthorisationPage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.button('Continue', true)).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if you want to approve this absence').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/review-reason/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.yesRadio()).toBeChecked()
    await expect(testPage.noRadio()).not.toBeChecked()
  })
})
