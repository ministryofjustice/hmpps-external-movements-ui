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
import { formatInputDate } from '../../../../utils/dateTimeUtils'

class StartDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/start-date/,
      title: 'Enter absence start date and time - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add absence details',
      backUrl: /single-or-repeating/,
    })
  }

  dateField() {
    return this.textbox(/What date will (.+?) be released\?/)
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }
}

test.describe('/add-temporary-absence/start-date', () => {
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

    await page.goto(`/${journeyId}/add-temporary-absence/start-date`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new StartDatePage(page).verifyContent()

    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.dateField()).toHaveValue('')
    await expect(testPage.hourField()).toBeVisible()
    await expect(testPage.hourField()).toHaveValue('')
    await expect(testPage.minuteField()).toBeVisible()
    await expect(testPage.minuteField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter or select a release date').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a release time').click()
    await expect(testPage.hourField()).toBeFocused()

    await testPage.dateField().fill('1/1/1999')
    await testPage.hourField().fill('24')
    await testPage.minuteField().fill('b')
    await testPage.clickContinue()

    await testPage.link('Release date must be today or in the future').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Release time hour must be 00 to 23').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('Release time minute must be 00 to 59').click()
    await expect(testPage.minuteField()).toBeFocused()

    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.hourField().fill('00')
    await testPage.minuteField().fill('00')
    await testPage.clickContinue()

    await testPage.link('Release time must be in the future').click()
    await expect(testPage.hourField()).toBeFocused()

    // verify next page routing
    const inputDate = new Date()
    inputDate.setDate(inputDate.getDate() + 5)
    const inputDateString = formatInputDate(inputDate.toISOString())!

    await testPage.dateField().fill(inputDateString)
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/end-date/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(inputDateString)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
  })
})
