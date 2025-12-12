import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetReferenceData,
  stubGetTapAuthorisation,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationAccompaniedByPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/edit/accompanied unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/accompanied`)
  })
})

test.describe('/temporary-absence-authorisations/edit/accompanied', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubGetReferenceData('accompanied-by'),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/accompanied`)
  }

  test('should try cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapAuthorisationAccompaniedByPage(page).verifyContent()

    await expect(testPage.accompaniedByRadio()).toBeVisible()
    await expect(testPage.accompaniedByRadio()).not.toBeChecked()

    // verify validation errors
    await testPage.clickContinue()
    await testPage.link('Select who will accompany the prisoner').click()
    await expect(testPage.accompaniedByRadio()).toBeFocused()

    // verify next page routing
    await testPage.accompaniedByRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/change-confirmation/)
  })
})
