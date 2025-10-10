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
import { SelectDaysTimesWeeklyPage } from './test.page'

test.describe('/add-temporary-absence/select-days-times-weekly', () => {
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
        startDate: '2025-05-05',
        startTime: '10:00',
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/select-days-times-weekly`)
  }

  test('should test the select days and times page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SelectDaysTimesWeeklyPage(page).verifyContent()

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await validateEmptyErrorMessage(testPage)
    await validateInvalidHourMinuteErrorMessage(testPage)
    await testPage.checkbox('Is this an overnight absence?').first().uncheck()
    await validateReturnTimeAfterReleaseTimeErrorMessage(testPage)
    await validateOvernightTimeAfterReleaseTimeErrorMessage(testPage)

    // verify next page routing
    await testPage.timeEntry('tuesday', 'Release', 'Hour').fill('14')
    await testPage.timeEntry('tuesday', 'Release', 'Minute').fill('30')
    await testPage.timeEntry('tuesday', 'Return', 'Hour').fill('17')
    await testPage.timeEntry('tuesday', 'Return', 'Minute').fill('30')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/check-absences-weekly/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    await expect(testPage.checkbox('Monday')).toBeChecked()
    await expect(testPage.checkbox('Tuesday')).toBeChecked()

    await expect(testPage.timeEntry('monday', 'Release', 'Hour')).toHaveValue('10')
    await expect(testPage.timeEntry('monday', 'Release', 'Minute')).toHaveValue('30')
    await expect(testPage.timeEntry('monday', 'Return', 'Hour')).toHaveValue('')
    await expect(testPage.timeEntry('monday', 'Return', 'Minute')).toHaveValue('')
    await expect(testPage.timeEntry('monday', 'Overnight', 'Hour')).toHaveValue('10')
    await expect(testPage.timeEntry('monday', 'Overnight', 'Minute')).toHaveValue('30')
    await expect(testPage.isOvernight('monday')).toBeChecked()

    await expect(testPage.timeEntry('tuesday', 'Release', 'Hour')).toHaveValue('14')
    await expect(testPage.timeEntry('tuesday', 'Release', 'Minute')).toHaveValue('30')
    await expect(testPage.timeEntry('tuesday', 'Return', 'Hour')).toHaveValue('17')
    await expect(testPage.timeEntry('tuesday', 'Return', 'Minute')).toHaveValue('30')
    await expect(testPage.timeEntry('tuesday', 'Overnight', 'Hour')).toHaveValue('')
    await expect(testPage.timeEntry('tuesday', 'Overnight', 'Minute')).toHaveValue('')
    await expect(testPage.isOvernight('tuesday')).not.toBeChecked()
  })

  const validateEmptyErrorMessage = async (testPage: SelectDaysTimesWeeklyPage) => {
    await testPage.clickContinue()
    await expect(testPage.button('Continue')).toBeVisible()
    await testPage.link('Select at least one day').click()
    await expect(testPage.checkbox('Monday')).toBeFocused()
    await testPage.checkbox('Monday').check()
    await testPage.clickContinue()

    await testPage.link('Enter a release time').click()
    await expect(testPage.timeEntry('monday', 'Release', 'Hour')).toBeFocused()

    await testPage.link('Enter a return time').click()
    await expect(testPage.timeEntry('monday', 'Return', 'Hour')).toBeFocused()

    await testPage.checkbox('Is this an overnight absence?').first().check()
    await testPage.clickContinue()

    await testPage.link('Enter an overnight time').click()
    await expect(testPage.timeEntry('monday', 'Overnight', 'Hour')).toBeFocused()
  }

  const validateInvalidHourMinuteErrorMessage = async (testPage: SelectDaysTimesWeeklyPage) => {
    await testPage.timeEntry('monday', 'Release', 'Hour').fill('24')
    await testPage.timeEntry('monday', 'Release', 'Minute').fill('60')
    await testPage.timeEntry('monday', 'Overnight', 'Hour').fill('24')
    await testPage.timeEntry('monday', 'Overnight', 'Minute').fill('60')
    await testPage.clickContinue()

    await expect(testPage.link('Enter a valid release time')).toBeVisible()
    await expect(testPage.link('Enter a valid overnight time')).toBeVisible()

    await testPage.checkbox('Is this an overnight absence?').first().uncheck()
    await testPage.timeEntry('monday', 'Return', 'Hour').fill('24')
    await testPage.timeEntry('monday', 'Return', 'Minute').fill('60')
    await testPage.clickContinue()

    await expect(testPage.link('Enter a valid return time')).toBeVisible()
  }

  const validateReturnTimeAfterReleaseTimeErrorMessage = async (testPage: SelectDaysTimesWeeklyPage) => {
    await testPage.timeEntry('monday', 'Release', 'Hour').fill('10')
    await testPage.timeEntry('monday', 'Release', 'Minute').fill('30')

    await testPage.timeEntry('monday', 'Return', 'Hour').fill('09')
    await testPage.timeEntry('monday', 'Return', 'Minute').fill('30')
    await testPage.clickContinue()
    await expect(testPage.link('The return time must come after the release date and time')).toBeVisible()
  }

  const validateOvernightTimeAfterReleaseTimeErrorMessage = async (testPage: SelectDaysTimesWeeklyPage) => {
    await testPage.checkbox('Is this an overnight absence?').first().check()
    await testPage.timeEntry('monday', 'Release', 'Hour').fill('10')
    await testPage.timeEntry('monday', 'Release', 'Minute').fill('30')

    await testPage.timeEntry('monday', 'Overnight', 'Hour').fill('09')
    await testPage.timeEntry('monday', 'Overnight', 'Minute').fill('30')

    await testPage.checkbox('Tuesday').check()
    await testPage.timeEntry('tuesday', 'Release', 'Hour').fill('02')
    await testPage.timeEntry('tuesday', 'Release', 'Minute').fill('30')
    await testPage.clickContinue()

    await expect(testPage.link('The release time must be later than the overnight return time')).toBeVisible()
  }
})
