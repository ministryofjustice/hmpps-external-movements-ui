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
import { FreeformSelectDaysPage } from './test.page'

test.describe('/add-temporary-absence/select-days-and-time', () => {
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

  const startJourney = async (page: Page, journeyId: string, idx?: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: true,
        fromDate: '2001-01-01',
        toDate: '2001-01-18',
        patternType: 'FREEFORM',
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/select-days-and-times${idx ? `/${idx}` : ''}`)
  }

  test('should try minimal input', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new FreeformSelectDaysPage(page).verifyContent('1 January to 7 January', /repeating-pattern/)

    await expect(testPage.releaseDateField(0)).toBeVisible()
    await expect(testPage.releaseDateField(0)).toHaveValue('')
    await expect(testPage.releaseHourField(0)).toBeVisible()
    await expect(testPage.releaseHourField(0)).toHaveValue('')
    await expect(testPage.releaseMinuteField(0)).toBeVisible()
    await expect(testPage.releaseMinuteField(0)).toHaveValue('')
    await expect(testPage.returnDateField(0)).toBeVisible()
    await expect(testPage.returnDateField(0)).toHaveValue('')
    await expect(testPage.returnHourField(0)).toBeVisible()
    await expect(testPage.returnHourField(0)).toHaveValue('')
    await expect(testPage.returnMinuteField(0)).toBeVisible()
    await expect(testPage.returnMinuteField(0)).toHaveValue('')
    await expect(testPage.button('Add another absence')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.button('Remove')).toHaveCount(0)

    // verify mandatory input
    await testPage.clickContinue()
    await testPage.link('Enter or select a release date').click()
    await expect(testPage.releaseDateField(0)).toBeFocused()

    // verify minimal input
    await testPage.releaseDateField(0).fill('1/1/2001')
    await testPage.releaseHourField(0).fill('10')
    await testPage.releaseMinuteField(0).fill('00')
    await testPage.returnDateField(0).fill('1/1/2001')
    await testPage.returnHourField(0).fill('17')
    await testPage.returnMinuteField(0).fill('30')

    await testPage.clickContinue()
    expect(page.url()).toMatch(/select-days-and-times\/2/)
  })

  test('should try input validation and persistence', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new FreeformSelectDaysPage(page).verifyContent('1 January to 7 January', /repeating-pattern/)

    await expect(testPage.releaseDateField(0)).toBeVisible()
    await expect(testPage.releaseDateField(0)).toHaveValue('')
    await expect(testPage.releaseHourField(0)).toBeVisible()
    await expect(testPage.releaseHourField(0)).toHaveValue('')
    await expect(testPage.releaseMinuteField(0)).toBeVisible()
    await expect(testPage.releaseMinuteField(0)).toHaveValue('')
    await expect(testPage.returnDateField(0)).toBeVisible()
    await expect(testPage.returnDateField(0)).toHaveValue('')
    await expect(testPage.returnHourField(0)).toBeVisible()
    await expect(testPage.returnHourField(0)).toHaveValue('')
    await expect(testPage.returnMinuteField(0)).toBeVisible()
    await expect(testPage.returnMinuteField(0)).toHaveValue('')
    await expect(testPage.button('Add another absence')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.button('Remove')).toHaveCount(0)

    // verify validation error
    await testPage.clickButton('Add another absence')
    await testPage.clickButton('Add another absence')
    await testPage.clickButton('Add another absence')
    await testPage.clickButton('Add another absence')
    await testPage.clickButton('Add another absence')

    await testPage.releaseDateField(0).fill('31/12/2000')
    await testPage.releaseHourField(0).fill('x')
    await testPage.releaseMinuteField(0).fill('00')
    await testPage.returnDateField(0).fill('9/1/2001')
    await testPage.returnHourField(0).fill('10')
    await testPage.returnMinuteField(0).fill('')

    await testPage.releaseDateField(1).fill('1/1/2001')
    await testPage.releaseHourField(1).fill('10')
    await testPage.releaseMinuteField(1).fill('00')
    await testPage.returnDateField(1).fill('1/1/2001')
    await testPage.returnHourField(1).fill('10')
    await testPage.returnMinuteField(1).fill('00')

    await testPage.releaseDateField(2).fill('2/1/2001')
    await testPage.releaseHourField(2).fill('10')
    await testPage.releaseMinuteField(2).fill('00')
    await testPage.returnDateField(2).fill('1/1/2001')
    await testPage.returnHourField(2).fill('10')
    await testPage.returnMinuteField(2).fill('00')

    await testPage.releaseDateField(3).fill('1/1/2001')
    await testPage.releaseHourField(3).fill('10')
    await testPage.releaseMinuteField(3).fill('00')
    await testPage.returnDateField(3).fill('3/1/2001')
    await testPage.returnHourField(3).fill('10')
    await testPage.returnMinuteField(3).fill('00')

    await testPage.releaseDateField(4).fill('1/1/2001')
    await testPage.releaseHourField(4).fill('10')
    await testPage.releaseMinuteField(4).fill('00')
    await testPage.returnDateField(4).fill('1/1/2001')
    await testPage.returnHourField(4).fill('17')
    await testPage.returnMinuteField(4).fill('30')

    await testPage.releaseHourField(5).fill('10')
    await testPage.releaseMinuteField(5).fill('00')
    await testPage.returnHourField(5).fill('17')
    await testPage.returnMinuteField(5).fill('30')

    await testPage.clickContinue()

    await testPage.link('Release date must be between 1/1/2001 and 7/1/2001').click()
    await expect(testPage.releaseDateField(0)).toBeFocused()
    await testPage.link('Return date must be between 1/1/2001 and 8/1/2001').click()
    await expect(testPage.returnDateField(0)).toBeFocused()
    await testPage.link('Release time hour must be 00 to 23').click()
    await expect(testPage.releaseHourField(0)).toBeFocused()
    await testPage.link('Enter a return time').click()
    await expect(testPage.returnMinuteField(0)).toBeFocused()
    await testPage.link('Return time must be later than release time').click()
    await expect(testPage.returnHourField(1)).toBeFocused()
    await testPage.link('Return date must be equal to or later than release date').click()
    await expect(testPage.returnDateField(2)).toBeFocused()
    await testPage.link('Return date must be the same day or one day after release date').click()
    await expect(testPage.returnDateField(3)).toBeFocused()
    await testPage.link('Enter or select a release date').click()
    await expect(testPage.releaseDateField(5)).toBeFocused()
    await testPage.link('Enter or select a return date').click()
    await expect(testPage.returnDateField(5)).toBeFocused()

    // verify next page routing
    await testPage.button('Remove').nth(5).click()
    await testPage.button('Remove').nth(3).click()
    await testPage.button('Remove').nth(2).click()
    await testPage.button('Remove').nth(1).click()
    await testPage.button('Remove').nth(0).click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/select-days-and-times\/2/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.releaseDateField(0)).toHaveValue('1/1/2001')
    await expect(testPage.releaseHourField(0)).toHaveValue('10')
    await expect(testPage.releaseMinuteField(0)).toHaveValue('00')
    await expect(testPage.returnDateField(0)).toHaveValue('1/1/2001')
    await expect(testPage.returnHourField(0)).toHaveValue('17')
    await expect(testPage.returnMinuteField(0)).toHaveValue('30')
  })

  test('should try page routing in the middle', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, '2')

    const testPage = await new FreeformSelectDaysPage(page).verifyContent('8 January to 14 January (optional)', /1/)

    // verify optional input, empty form allowed
    await testPage.clickContinue()
    expect(page.url()).toMatch(/select-days-and-times\/3/)
  })

  test('should try page routing on the last page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, '3')

    const testPage = await new FreeformSelectDaysPage(page).verifyContent('15 January to 18 January', /2/)

    // verify mandatory input
    await testPage.clickContinue()
    await testPage.link('Enter or select a release date').click()
    await expect(testPage.releaseDateField(0)).toBeFocused()

    // verify minimal input
    await testPage.releaseDateField(0).fill('18/1/2001')
    await testPage.releaseHourField(0).fill('10')
    await testPage.releaseMinuteField(0).fill('00')
    await testPage.returnDateField(0).fill('18/1/2001')
    await testPage.returnHourField(0).fill('17')
    await testPage.returnMinuteField(0).fill('30')

    await testPage.clickContinue()
    expect(page.url()).toMatch(/check-absences/)
  })
})
