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

export class EndDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/end-date/,
      title: 'Enter absence end date and time - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add absence details',
      backUrl: /start-date/,
    })
  }

  dateField() {
    return this.textbox(/What date will (.+?) return to prison\?/)
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }
}

test.describe('/add-temporary-absence/end-date', () => {
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
        startDate: '2025-05-05',
        startTime: '10:00',
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/end-date`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EndDatePage(page).verifyContent()

    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.dateField()).toHaveValue('')
    await expect(testPage.hourField()).toBeVisible()
    await expect(testPage.hourField()).toHaveValue('')
    await expect(testPage.minuteField()).toBeVisible()
    await expect(testPage.minuteField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter or select a return date').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a return time').click()
    await expect(testPage.hourField()).toBeFocused()

    await testPage.dateField().fill('1/1/1999')
    await testPage.hourField().fill('24')
    await testPage.minuteField().fill('059')
    await testPage.clickContinue()

    await testPage.link('Enter a date that is the same as or later than 5/5/2025').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Return time hour must be 00 to 23').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('Return time minute must be 00 to 59').click()
    await expect(testPage.minuteField()).toBeFocused()

    await testPage.dateField().fill('5/5/2025')
    await testPage.hourField().fill('10')
    await testPage.minuteField().fill('0')
    await testPage.clickContinue()

    await testPage.link('Enter a time that is later than 10:00').click()
    await expect(testPage.hourField()).toBeFocused()

    // verify next page routing
    await testPage.dateField().fill('6/5/2025')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/location-type/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue('6/5/2025')
    await expect(testPage.hourField()).toHaveValue('10')
    await expect(testPage.minuteField()).toHaveValue('00')
  })
})
