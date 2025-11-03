import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetAbsenceCategory,
  stubGetAllAbsenceTypes,
} from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { AbsenceReasonPage } from './test.page'

test.describe('/add-temporary-absence/reason', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubGetAbsenceCategory('ABSENCE_SUB_TYPE', 'SPL'),
      stubGetAbsenceCategory('ABSENCE_REASON_CATEGORY', 'PW'),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string, workReason: boolean) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    if (workReason) {
      await injectJourneyData(page, journeyId, {
        addTemporaryAbsence: {
          categorySubJourney: {
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
          },
        },
      })
    } else {
      await injectJourneyData(page, journeyId, {
        addTemporaryAbsence: {
          categorySubJourney: {
            absenceType: {
              code: 'SR',
              description: 'Standard ROTL (Release on Temporary Licence)',
              nextDomain: 'ABSENCE_SUB_TYPE',
            },
            absenceSubType: {
              code: 'SPL',
              description: 'SPL (Special Purpose Licence)',
              hintText:
                'For prisoners to spend time at their release address to re-establish links with family and the local community.',
              nextDomain: 'ABSENCE_REASON',
            },
          },
        },
      })
    }

    await page.goto(`/${journeyId}/add-temporary-absence/reason`)
  }

  test('should try work reasons scenario', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, true)

    // verify page content
    const testPage = await new AbsenceReasonPage(page).verifyContent(true)

    await expect(testPage.workReasonRadio()).toBeVisible()
    await expect(testPage.workReasonRadio()).not.toBeChecked()
    await expect(testPage.otherReasonRadio()).toHaveCount(0)
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a type of work').click()
    await expect(testPage.workReasonRadio()).toBeFocused()

    // verify next page routing
    await testPage.workReasonRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/single-or-repeating/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.workReasonRadio()).toBeChecked()
  })

  test('should try other reasons scenario', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, false)

    // verify page content
    const testPage = await new AbsenceReasonPage(page).verifyContent(false)

    await expect(testPage.otherReasonRadio()).toBeVisible()
    await expect(testPage.otherReasonRadio()).not.toBeChecked()
    await expect(testPage.workReasonRadio()).toHaveCount(0)
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a reason').click()
    await expect(testPage.otherReasonRadio()).toBeFocused()

    // verify next page routing
    await testPage.otherReasonRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/single-or-repeating/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.otherReasonRadio()).toBeChecked()
  })
})
