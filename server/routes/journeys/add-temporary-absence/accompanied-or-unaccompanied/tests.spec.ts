import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'

class AccompaniedOrUnaccompaniedPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/accompanied-or-unaccompanied/,
      title: 'Select if accompanied or unaccompanied - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Will Prisoner-Name Prisoner-Surname be accompanied?',
      backUrl: /location-search/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}

test.describe('/add-temporary-absence/accompanied-or-unaccompanied', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: false,
      },
    })
    await page.goto(`/${journeyId}/add-temporary-absence/accompanied-or-unaccompanied`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AccompaniedOrUnaccompaniedPage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if the prisoner will be accompanied').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied($|\?+.*$)/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.yesRadio()).toBeChecked()
  })

  test('should try routing to transport page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AccompaniedOrUnaccompaniedPage(page).verifyContent()

    // verify next page routing
    await testPage.noRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/transport($|\?+.*$)/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.noRadio()).toBeChecked()
  })
})
