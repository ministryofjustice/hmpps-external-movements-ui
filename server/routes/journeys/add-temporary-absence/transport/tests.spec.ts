import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import {
  stubGetAllAbsenceTypes,
  stubGetReferenceData,
} from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { TransportPage } from './test.page'

test.describe('/add-temporary-absence/transport', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubGetReferenceData('transport'),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string, isAccompanied: boolean) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, { addTemporaryAbsence: { accompanied: isAccompanied } })
    await page.goto(`/${journeyId}/add-temporary-absence/transport`)
  }

  test('should try happy path', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, true)

    // verify page content
    const testPage = await new TransportPage(page).verifyContent(true)

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await testPage.clickContinue()
    await testPage.link('Select a transport option').click()
    await expect(testPage.transportTypeRadio()).toBeFocused()
    await testPage.transportTypeRadio().click()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/comments/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.transportTypeRadio()).toBeChecked()
  })

  test('should try back url to accompanied-or-unaccompanied', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, false)

    // verify page content
    await new TransportPage(page).verifyContent(false)
  })
})
