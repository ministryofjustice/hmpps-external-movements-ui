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
import { EnterShiftPatternPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/enter-shift-pattern unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/enter-shift-pattern`)
  })
})

test.describe('/add-temporary-absence/enter-shift-pattern', () => {
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
        start: '2001-01-01',
        end: '2001-03-18',
        patternType: 'SHIFT',
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/enter-shift-pattern`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EnterShiftPatternPage(page).verifyContent()

    await expect(testPage.shiftType(0)).toBeVisible()
    await expect(testPage.shiftType(0)).toHaveValue('DAY')
    await expect(testPage.numberInput(0)).toBeVisible()
    await expect(testPage.numberInput(0)).toHaveValue('')
    await expect(testPage.startHourField(0)).toBeVisible()
    await expect(testPage.startHourField(0)).toHaveValue('')
    await expect(testPage.startMinuteField(0)).toBeVisible()
    await expect(testPage.startMinuteField(0)).toHaveValue('')
    await expect(testPage.returnHourField(0)).toBeVisible()
    await expect(testPage.returnHourField(0)).toHaveValue('')
    await expect(testPage.returnMinuteField(0)).toBeVisible()
    await expect(testPage.returnMinuteField(0)).toHaveValue('')

    await expect(testPage.shiftType(1)).toBeVisible()
    await expect(testPage.shiftType(1)).toHaveValue('REST')
    await expect(testPage.numberInput(1)).toBeVisible()
    await expect(testPage.numberInput(1)).toHaveValue('')
    await expect(testPage.startHourField(1)).not.toBeVisible()
    await expect(testPage.startMinuteField(1)).not.toBeVisible()
    await expect(testPage.returnHourField(1)).not.toBeVisible()
    await expect(testPage.returnMinuteField(1)).not.toBeVisible()

    await expect(testPage.button('Add another row')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.button('Remove')).toHaveCount(2)

    // verify validation error
    await testPage.remove(0).click()
    await testPage.numberInput(0).fill('1')
    await testPage.clickContinue()
    await testPage.clickLink('Add at least two rows to the schedule')
    await expect(testPage.addAnother()).toBeFocused()

    await testPage.addAnother().click()
    await testPage.clickContinue()
    await testPage.clickLink('Select shift type')
    await expect(testPage.shiftType(1)).toBeFocused()

    await testPage.shiftType(1).selectOption('DAY')
    await testPage.clickContinue()
    await testPage.clickLink('Enter a valid number')
    await expect(testPage.numberInput(1)).toBeFocused()
    await testPage.clickLink('Enter a start time')
    await expect(testPage.startHourField(0)).toBeFocused()
    await testPage.clickLink('Enter a return time')
    await expect(testPage.returnHourField(0)).toBeFocused()

    await testPage.numberInput(1).fill('2')
    await testPage.startHourField(0).fill('3')
    await testPage.startMinuteField(0).fill('3')
    await testPage.returnHourField(0).fill('2')
    await testPage.returnMinuteField(0).fill('2')
    await testPage.clickContinue()
    await testPage.clickLink('Return time must be later than start time for scheduled days')
    await expect(testPage.returnHourField(0)).toBeFocused()

    await testPage.shiftType(1).selectOption('NIGHT')
    await testPage.clickContinue()
    await testPage.clickLink('Add rest days to the end of the schedule')
    await expect(testPage.addAnother()).toBeFocused()

    // verify next page routing
    await testPage.addAnother().click()
    await testPage.shiftType(2).selectOption('REST')
    await testPage.numberInput(2).fill('1')
    await testPage.remove(0).click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/check-absences/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.shiftType(0)).toHaveValue('NIGHT')
    await expect(testPage.numberInput(0)).toHaveValue('2')
    await expect(testPage.startHourField(0)).toHaveValue('03')
    await expect(testPage.startMinuteField(0)).toHaveValue('03')
    await expect(testPage.returnHourField(0)).toHaveValue('02')
    await expect(testPage.returnMinuteField(0)).toHaveValue('02')
    await expect(testPage.shiftType(1)).toHaveValue('REST')
    await expect(testPage.numberInput(1)).toHaveValue('1')
  })
})
