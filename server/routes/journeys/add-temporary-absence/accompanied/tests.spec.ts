import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { stubGetReferenceData } from '../../../../../integration_tests/mockApis/externalMovementsApi'

class AccompaniedPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/accompanied$/,
      title: 'Select who will accompany the prisoner - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'Who will accompany Prisoner-Name Prisoner-Surname?',
      backUrl: /accompanied-or-unaccompanied/,
    })
  }

  accompaniedByRadio() {
    return this.radio('accompaniedBy A')
  }
}

test.describe('/add-temporary-absence/accompanied', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetReferenceData('accompanied-by'),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        accompaniedSubJourney: {
          accompanied: true,
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/accompanied`)
  }

  test('should try work reasons scenario', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AccompaniedPage(page).verifyContent()

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await testPage.clickContinue()

    await testPage.link('Select who will accompany the prisoner').click()
    await expect(testPage.accompaniedByRadio()).toBeFocused()
    await testPage.accompaniedByRadio().click()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/transport/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
  })
})
