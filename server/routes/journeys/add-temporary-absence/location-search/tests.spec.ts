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
import { LocationSearchPage } from './test.page'

test.describe('/add-temporary-absence/location-search', () => {
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
    await page.goto(`/${journeyId}/add-temporary-absence/location-search`)
  }

  test('should try happy path', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new LocationSearchPage(page).verifyContent()

    await expect(testPage.searchButton()).toBeVisible()

    // verify validation errors
    await testPage.searchButton().click()
    await testPage.link('Enter an address or postcode').click()
    await expect(testPage.searchBox()).toBeFocused()
    await testPage.searchBox().fill('idklol')

    // verify next page routing
    await testPage.searchButton().click()
    expect(page.url()).toMatch(/\/add-temporary-absence\/location-search/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.searchBox()).toHaveValue('idklol')

    await testPage.page.getByRole('link', { name: '147 Marlborough Road, London, N19 5QH' }).first().click()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)
  })
})
