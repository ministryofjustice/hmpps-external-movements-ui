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
import { SingleOrRepeatingPage } from './test.page'

test.describe('/add-temporary-absence/single-or-repeating', () => {
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

  const startJourney = async (page: Page, journeyId: string, fromReasonPage: boolean) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    if (fromReasonPage) {
      await injectJourneyData(page, journeyId, {
        addTemporaryAbsence: {
          absenceType: {
            code: 'SR',
            description: 'Standard ROTL (Release on Temporary Licence)',
            nextDomain: 'ABSENCE_SUB_TYPE',
          },
          absenceSubType: {
            code: 'RDR',
            description: 'RDR (Resettlement Day Release)',
            hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
            nextDomain: 'ABSENCE_REASON_CATEGORY',
          },
          reasonCategory: {
            code: 'PW',
            description: 'Paid work',
            nextDomain: 'ABSENCE_REASON',
          },
          reason: {
            code: 'R16',
            description: 'Paid work - Agriculture and horticulture',
          },
        },
      })
    } else {
      await injectJourneyData(page, journeyId, {
        addTemporaryAbsence: {
          absenceType: {
            code: 'PP',
            description: 'Police production',
          },
        },
      })
    }

    await page.goto(`/${journeyId}/add-temporary-absence/single-or-repeating`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, true)

    // verify page content
    const testPage = await new SingleOrRepeatingPage(page).verifyContent(/reason$/)

    await expect(testPage.singleRadio()).toBeVisible()
    await expect(testPage.singleRadio()).not.toBeChecked()
    await expect(testPage.repeatingRadio()).toBeVisible()
    await expect(testPage.repeatingRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()
    testPage.historyParam(page.url(), [/\/add-temporary-absence\/single-or-repeating/])

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if this is a single or repeating absence').click()
    await expect(testPage.singleRadio()).toBeFocused()

    // verify next page routing
    await testPage.singleRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/start-date/)
    testPage.historyParam(page.url(), [
      /\/add-temporary-absence\/single-or-repeating/,
      /\/add-temporary-absence\/start-date/,
    ])

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.singleRadio()).toBeChecked()
    testPage.historyParam(page.url(), [/\/add-temporary-absence\/single-or-repeating/])
  })

  test('should try routing to start-end-date', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, true)

    // verify page content
    const testPage = await new SingleOrRepeatingPage(page).verifyContent(/reason$/)

    // verify next page routing
    await testPage.repeatingRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/start-end-date/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.repeatingRadio()).toBeChecked()
  })

  test('should try back url to absence-type page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, false)

    // verify page content
    await new SingleOrRepeatingPage(page).verifyContent(/absence-type$/)
  })
})
