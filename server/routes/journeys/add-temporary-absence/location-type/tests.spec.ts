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
import { LocationTypePage } from './test.page'

test.describe('/add-temporary-absence/location-type', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubGetReferenceData('location-type'),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await page.goto(`/${journeyId}/add-temporary-absence/location-type`)
  }

  test('should try happy path', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new LocationTypePage(page).verifyContent()

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await testPage.clickContinue()
    await testPage.link('Select a location type').click()
    await expect(testPage.locationTypeRadio()).toBeFocused()
    await testPage.locationTypeRadio().click()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/location-search/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.locationTypeRadio()).toBeChecked()
  })
})
