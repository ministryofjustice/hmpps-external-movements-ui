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
import { MultiAbsencesPerDayPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/multi-absences-per-day unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/multi-absences-per-day`)
  })
})

test.describe('/add-temporary-absence/multi-absences-per-day', () => {
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
        end: '2001-03-01',
        patternType: 'WEEKLY',
      },
    })
    await page.goto(`/${journeyId}/add-temporary-absence/multi-absences-per-day`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new MultiAbsencesPerDayPage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.absencesPerDayInput()).not.toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if the prisoner will have multiple absences in the same day').click()
    await expect(testPage.yesRadio()).toBeFocused()

    await testPage.yesRadio().click()
    await testPage.absencesPerDayInput().fill('1')
    await testPage.clickContinue()
    await testPage.link('Enter the number of absences each day (enter between 2 and 10)').click()
    await expect(testPage.absencesPerDayInput()).toBeFocused()

    // verify next page routing
    await testPage.absencesPerDayInput().fill('05')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/select-days-times-weekly/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.yesRadio()).toBeChecked()
    await expect(testPage.absencesPerDayInput()).toBeVisible()
    await expect(testPage.absencesPerDayInput()).toHaveValue('5')
  })

  test('should try no multi absence option', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new MultiAbsencesPerDayPage(page).verifyContent()

    // verify next page routing
    await testPage.noRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/select-days-times-weekly/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.noRadio()).toBeChecked()
    await expect(testPage.absencesPerDayInput()).not.toBeVisible()
  })
})
