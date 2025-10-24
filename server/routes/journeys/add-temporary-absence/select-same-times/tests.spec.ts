import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import { resetStubs } from '../../../../../integration_tests/mockApis/wiremock'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { SelectSameTimesPage } from './test.page'

test.describe('/add-temporary-absence/select-same-times', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        rotatingPatternSubJourney: {
          intervals: [],
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/select-same-times`)
  }

  test('should try work reasons scenario', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SelectSameTimesPage(page).verifyContent()

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await testPage.clickContinue()

    await testPage.link('Select if the scheduled days or nights take place at the same times').click()
    await expect(testPage.rotatingPatternSubJourneyRadioYes()).toBeFocused()
    await testPage.rotatingPatternSubJourneyRadioYes().click()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/rotating-release-return-times/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    await expect(testPage.rotatingPatternSubJourneyRadioYes()).toBeChecked()

    await page.goBack()
    await testPage.rotatingPatternSubJourneyRadioNo().click()

    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/rotating-non-repeating-release-return-times/)
  })
})
