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
import { StartEndDatesPage } from './test.page'

test.describe('/add-temporary-absence/start-end-dates', () => {
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
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/start-end-dates`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new StartEndDatesPage(page).verifyContent()

    await expect(testPage.fromDateField()).toBeVisible()
    await expect(testPage.fromDateField()).toHaveValue('')
    await expect(testPage.toDateField()).toBeVisible()
    await expect(testPage.toDateField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter or select a start date').click()
    await expect(testPage.fromDateField()).toBeFocused()
    await testPage.link('Enter or select a return date').click()
    await expect(testPage.toDateField()).toBeFocused()

    await testPage.fromDateField().fill('1/1/1999')
    await testPage.toDateField().fill('x')
    await testPage.clickContinue()

    await testPage.link('Start date must be today or in the future').click()
    await expect(testPage.fromDateField()).toBeFocused()
    await testPage.link('Enter or select a valid return date').click()
    await expect(testPage.toDateField()).toBeFocused()

    const nextYear = new Date().getFullYear() + 1

    await testPage.fromDateField().fill(`4/4/${nextYear}`)
    await testPage.toDateField().fill(`3/3/${nextYear}`)
    await testPage.clickContinue()

    await testPage.link('Last return date must be later than first start date').click()
    await expect(testPage.toDateField()).toBeFocused()

    await testPage.fromDateField().fill(`1/1/${nextYear}`)
    await testPage.toDateField().fill(`2/7/${nextYear}`)
    await testPage.clickContinue()

    await testPage.link('Absence period can only extend to 6 months from the entry date').click()
    await expect(testPage.toDateField()).toBeFocused()

    // verify next page routing
    await testPage.fromDateField().fill(`1/1/${nextYear}`)
    await testPage.toDateField().fill(`1/7/${nextYear}`)
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/repeating-pattern/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.fromDateField()).toHaveValue(`1/1/${nextYear}`)
    await expect(testPage.toDateField()).toHaveValue(`1/7/${nextYear}`)
  })
})
