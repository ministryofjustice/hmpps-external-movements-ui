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
import { ReasonCategoryPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/reason-category unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/reason-category`)
  })
})

test.describe('/add-temporary-absence/reason-category', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubGetAbsenceCategory('ABSENCE_SUB_TYPE', 'RDR'),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
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
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/reason-category`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ReasonCategoryPage(page).verifyContent()

    await expect(testPage.fbRadio()).toBeVisible()
    await expect(testPage.fbRadio()).not.toBeChecked()
    await expect(testPage.pwRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a reason').click()
    await expect(testPage.fbRadio()).toBeFocused()

    // verify next page routing
    await testPage.pwRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/reason/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.pwRadio()).toBeChecked()
  })

  test('should try alternative routing to single-or-repeating', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ReasonCategoryPage(page).verifyContent()

    // verify next page routing
    await testPage.fbRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/single-or-repeating/)
  })
})
