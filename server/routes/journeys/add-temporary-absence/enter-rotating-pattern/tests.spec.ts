import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { EnterRotatingPatternPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/enter-rotating-pattern unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/enter-rotating-pattern`)
  })
})

test.describe('/add-temporary-absence/enter-rotating-pattern', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        start: '2025-12-25',
        end: '2025-12-31',
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/enter-rotating-pattern`)
  }

  test('should try work reasons scenario', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EnterRotatingPatternPage(page).verifyContent()
    await expect(testPage.page.getByText('This pattern will start on')).toContainText(
      '25 December 2025 and end on 31 December 2025',
    )

    await expect(testPage.button('Continue')).toBeVisible()

    await testPage.clickContinue()
    await validateEmptyNumberError(testPage)
    await validateInvalidNumberError(testPage)
    await validateSingleRowError(testPage)

    await testPage.numberInput(0).fill('1')
    await testPage.patternType(0).selectOption('Scheduled days')
    await testPage.numberInput(1).fill('2')
    await testPage.patternType(1).selectOption('Rest days')

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/select-same-times/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    await expect(testPage.numberInput(0)).toHaveValue('1')
    await expect(testPage.patternType(0)).toHaveValue('Scheduled days')
    await expect(testPage.numberInput(1)).toHaveValue('2')
    await expect(testPage.patternType(1)).toHaveValue('Rest days')
  })
})

const validateEmptyNumberError = async (testPage: EnterRotatingPatternPage) => {
  await expect(testPage.link('Enter a number').nth(0)).toBeVisible()
  await expect(testPage.link('Enter a number').nth(1)).toBeVisible()

  await testPage.link('Enter a number').nth(0).click()
  await expect(testPage.numberInput(0)).toBeFocused()

  await testPage.link('Enter a number').nth(1).click()
  await expect(testPage.numberInput(1)).toBeFocused()
}

const validateInvalidNumberError = async (testPage: EnterRotatingPatternPage) => {
  await expect(testPage.link('Enter a number').nth(0)).toBeVisible()

  await testPage.numberInput(0).fill('-1')
  await testPage.clickContinue()

  await expect(testPage.link('Enter a valid number').nth(0)).toBeVisible()
}

const validateSingleRowError = async (testPage: EnterRotatingPatternPage) => {
  await testPage.remove(0).click()

  await testPage.clickContinue()
  await expect(testPage.link('Add at least two rows to the schedule').nth(0)).toBeVisible()

  testPage.link('Add at least two rows to the schedule').nth(0).click()
  await expect(testPage.addAnother()).toBeFocused()

  await testPage.addAnother().click()
}
