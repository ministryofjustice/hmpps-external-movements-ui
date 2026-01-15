import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { SelectDaysTimesBiweeklyPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/select-days-times-biweekly unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/select-days-times-biweekly`)
  })
})

test.describe('/add-temporary-absence/select-days-times-biweekly', () => {
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
        startDate: '2025-05-05',
        startTime: '10:00',
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/select-days-times-biweekly`)
  }

  const startJourneyForSecondWeek = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        startDate: '2025-05-05',
        startTime: '10:00',
        biweeklyPattern: {
          weekA: [
            { day: 0, startTime: '01:00', returnTime: '02:00', overnight: false },
            { day: 6, startTime: '23:00', returnTime: '02:00', overnight: true },
          ],
          weekB: [],
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/select-days-times-biweekly-continued`)
  }

  test('should test the select days and times page for first week', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SelectDaysTimesBiweeklyPage(page).verifyContent()

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await validateEmptyErrorMessage(testPage)
    await validateInvalidHourMinuteErrorMessage(testPage)
    await testPage.checkbox('The prisoner will return after 23:59').first().uncheck()
    await validateReturnTimeAfterReleaseTimeErrorMessage(testPage)
    await validateOvernightTimeAfterReleaseTimeErrorMessage(testPage)

    // verify next page routing
    await testPage.timeEntry('tuesday', 'release', 'Hour').fill('14')
    await testPage.timeEntry('tuesday', 'release', 'Minute').fill('30')
    await testPage.timeEntry('tuesday', 'return', 'Hour').fill('17')
    await testPage.timeEntry('tuesday', 'return', 'Minute').fill('30')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/select-days-times-biweekly-continued/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    await expect(testPage.checkbox('Monday')).toBeChecked()
    await expect(testPage.checkbox('Tuesday')).toBeChecked()

    await expect(testPage.timeEntry('monday', 'release', 'Hour')).toHaveValue('10')
    await expect(testPage.timeEntry('monday', 'release', 'Minute')).toHaveValue('30')
    await expect(testPage.timeEntry('monday', 'return', 'Hour')).toHaveValue('09')
    await expect(testPage.timeEntry('monday', 'return', 'Minute')).toHaveValue('30')
    await expect(testPage.isOvernight('monday')).toBeChecked()

    await expect(testPage.timeEntry('tuesday', 'release', 'Hour')).toHaveValue('14')
    await expect(testPage.timeEntry('tuesday', 'release', 'Minute')).toHaveValue('30')
    await expect(testPage.timeEntry('tuesday', 'return', 'Hour')).toHaveValue('17')
    await expect(testPage.timeEntry('tuesday', 'return', 'Minute')).toHaveValue('30')
    await expect(testPage.isOvernight('tuesday')).not.toBeChecked()
  })

  test('should test the select days and times page for second week', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourneyForSecondWeek(page, journeyId)

    // verify page content
    const testPage = await new SelectDaysTimesBiweeklyPage(page).verifyContent(/select-days-times-biweekly$/)

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await validateOvernightTimeOverlapWithAnotherWeekErrorMessage(testPage)

    // verify next page routing
    await testPage.timeEntry('monday', 'release', 'Hour').fill('03')
    await testPage.timeEntry('monday', 'release', 'Minute').fill('30')
    await testPage.timeEntry('sunday', 'return', 'Hour').fill('00')
    await testPage.timeEntry('sunday', 'return', 'Minute').fill('30')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/check-absences/)
  })

  const validateEmptyErrorMessage = async (testPage: SelectDaysTimesBiweeklyPage) => {
    await testPage.clickContinue()
    await expect(testPage.button('Continue')).toBeVisible()
    await testPage.link('Select at least one day').click()
    await expect(testPage.checkbox('Monday')).toBeFocused()
    await testPage.checkbox('Monday').check()
    await testPage.clickContinue()

    await testPage.link('Enter a start time').click()
    await expect(testPage.timeEntry('monday', 'release', 'Hour')).toBeFocused()

    await testPage.link('Enter a return time').click()
    await expect(testPage.timeEntry('monday', 'return', 'Hour')).toBeFocused()
  }

  const validateInvalidHourMinuteErrorMessage = async (testPage: SelectDaysTimesBiweeklyPage) => {
    await testPage.timeEntry('monday', 'release', 'Hour').fill('24')
    await testPage.timeEntry('monday', 'release', 'Minute').fill('60')
    await testPage.timeEntry('monday', 'return', 'Hour').fill('24')
    await testPage.timeEntry('monday', 'return', 'Minute').fill('60')
    await testPage.clickContinue()

    await expect(testPage.link('Enter a valid start time')).toBeVisible()
    await expect(testPage.link('Enter a valid return time')).toBeVisible()
  }

  const validateReturnTimeAfterReleaseTimeErrorMessage = async (testPage: SelectDaysTimesBiweeklyPage) => {
    await testPage.timeEntry('monday', 'release', 'Hour').fill('10')
    await testPage.timeEntry('monday', 'release', 'Minute').fill('30')

    await testPage.timeEntry('monday', 'return', 'Hour').fill('09')
    await testPage.timeEntry('monday', 'return', 'Minute').fill('30')
    await testPage.clickContinue()
    await expect(testPage.link('Return time must be later than the start time')).toBeVisible()
  }

  const validateOvernightTimeAfterReleaseTimeErrorMessage = async (testPage: SelectDaysTimesBiweeklyPage) => {
    await testPage.checkbox('The prisoner will return after 23:59').first().check()
    await testPage.timeEntry('monday', 'release', 'Hour').fill('10')
    await testPage.timeEntry('monday', 'release', 'Minute').fill('30')

    await testPage.timeEntry('monday', 'return', 'Hour').fill('09')
    await testPage.timeEntry('monday', 'return', 'Minute').fill('30')

    await testPage.checkbox('Tuesday').check()
    await testPage.timeEntry('tuesday', 'release', 'Hour').fill('02')
    await testPage.timeEntry('tuesday', 'release', 'Minute').fill('30')
    await testPage.clickContinue()

    await expect(testPage.link('The start time must be later than the overnight return time')).toBeVisible()
  }

  const validateOvernightTimeOverlapWithAnotherWeekErrorMessage = async (testPage: SelectDaysTimesBiweeklyPage) => {
    await testPage.checkbox('Monday').check()
    await testPage.timeEntry('monday', 'release', 'Hour').fill('00')
    await testPage.timeEntry('monday', 'release', 'Minute').fill('30')
    await testPage.timeEntry('monday', 'return', 'Hour').fill('09')
    await testPage.timeEntry('monday', 'return', 'Minute').fill('30')

    await testPage.checkbox('Sunday').check()
    await testPage.checkbox('The prisoner will return after 23:59').nth(1).check()
    await testPage.timeEntry('sunday', 'release', 'Hour').fill('23')
    await testPage.timeEntry('sunday', 'release', 'Minute').fill('30')
    await testPage.timeEntry('sunday', 'return', 'Hour').fill('03')
    await testPage.timeEntry('sunday', 'return', 'Minute').fill('30')
    await testPage.clickContinue()

    await expect(testPage.link('The start time must be later than the overnight return time')).toBeVisible()
    await expect(
      testPage.link('The overnight return time must be earlier than the start time of the next day'),
    ).toBeVisible()
  }
})
