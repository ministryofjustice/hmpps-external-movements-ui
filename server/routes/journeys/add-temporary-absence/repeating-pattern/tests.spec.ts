import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { RepeatingPatternPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/repeating-pattern unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/repeating-pattern`)
  })
})

test.describe('/add-temporary-absence/repeating-pattern', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
    ])
  })

  test.beforeEach(async ({ page }) => {
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
        repeat: true,
        fromDate: '2001-01-01',
        toDate: '2001-03-01',
      },
    })
    await page.goto(`/${journeyId}/add-temporary-absence/repeating-pattern`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new RepeatingPatternPage(page).verifyContent()

    await expect(testPage.freeformRadio()).toBeVisible()
    await expect(testPage.freeformRadio()).not.toBeChecked()
    await expect(testPage.weeklyRadio()).toBeVisible()
    await expect(testPage.weeklyRadio()).not.toBeChecked()
    await expect(testPage.rotatingRadio()).toBeVisible()
    await expect(testPage.rotatingRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()
    testPage.historyParam(page.url(), [/\/add-temporary-absence\/repeating-pattern/])

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if the absences will take place in a repeating pattern').click()
    await expect(testPage.freeformRadio()).toBeFocused()

    // verify next page routing
    await testPage.freeformRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/select-days-and-times/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.freeformRadio()).toBeChecked()
  })

  test('should try routing to select-days-times-weekly', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new RepeatingPatternPage(page).verifyContent()

    // verify next page routing
    await testPage.weeklyRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/select-days-times-weekly/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.weeklyRadio()).toBeChecked()
  })

  test('should try routing to enter-shift-pattern', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new RepeatingPatternPage(page).verifyContent()

    // verify next page routing
    await testPage.rotatingRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/enter-shift-pattern/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.rotatingRadio()).toBeChecked()
  })
})
