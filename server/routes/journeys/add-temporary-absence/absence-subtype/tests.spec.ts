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
import { AbsenceSubTypePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/absence-subtype unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/absence-subtype`)
  })
})

test.describe('/add-temporary-absence/absence-subtype', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubGetAbsenceCategory('ABSENCE_TYPE', 'SR'),
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
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/absence-subtype`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AbsenceSubTypePage(page).verifyContent('standard ROTL (Release on Temporary Licence)')

    await expect(testPage.crlRadio()).toBeVisible()
    await expect(testPage.rdrRadio()).not.toBeChecked()
    await expect(testPage.splRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select the standard ROTL (Release on Temporary Licence) type').click()
    await expect(testPage.crlRadio()).toBeFocused()

    // verify next page routing
    await testPage.rdrRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/reason-category/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.rdrRadio()).toBeChecked()
  })

  test('should try alternative routing to reason', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AbsenceSubTypePage(page).verifyContent('standard ROTL (Release on Temporary Licence)')

    // verify next page routing
    await testPage.splRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/reason/)
  })

  test('should try alternative routing to single-or-repeating', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AbsenceSubTypePage(page).verifyContent('standard ROTL (Release on Temporary Licence)')

    // verify next page routing
    await testPage.crlRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/single-or-repeating/)
  })
})
