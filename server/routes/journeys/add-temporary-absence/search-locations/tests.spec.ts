import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testSearchAddressResults } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetAllAbsenceTypes,
  stubGetLocations,
} from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { SearchLocationsPage } from './test.page'
import { stubGetAddress, stubSearchAddresses } from '../../../../../integration_tests/mockApis/osPlacesApi'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/search-locations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/search-locations`)
  })
})

test.describe('/add-temporary-absence/search-locations', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubSearchAddresses('random', testSearchAddressResults),
      stubSearchAddresses('xxx', []),
      stubSearchAddresses('SW1H%209AJ', testSearchAddressResults), // query used by the module to check OS Places API availability
      stubGetAddress('1001', testSearchAddressResults[0]!),
      stubGetAddress('1002', testSearchAddressResults[1]!),
      stubGetLocations('LEI', {
        version: 'version',
        locations: [{ uprn: 9999, address: 'Saved Location, UK' }],
      }),
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
      },
    })
    await page.goto(`/${journeyId}/add-temporary-absence/search-locations`)
  }

  test('should search and select a UK address and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.button('Continue')).toHaveCount(0)
    await expect(testPage.button('Add location')).toHaveCount(1)

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.button('Add location')).toBeVisible()

    // verify validation error
    await testPage.searchField().fill('xxx')
    await testPage.clickButton('Add location')
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // add multiple locations
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickButton('Add location')

    await expect(testPage.button('Continue')).toBeVisible()

    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address 2, RS1 34T')
    await testPage.clickButton('Add location')

    await expect(page.getByText('Address, RS1 34T')).toBeVisible()
    await expect(page.getByText('Address 2, RS1 34T')).toBeVisible()

    // remove an address
    await testPage.clickLink('Remove location 2')
    await expect(page.getByText('Address, RS1 34T')).toBeVisible()
    await expect(page.getByText('Address 2, RS1 34T')).toHaveCount(0)

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)
  })

  test('should search and select a location and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()
    await testPage.clickTab('Select a saved location')

    // verify validation error
    await testPage.clickButton('Add location')
    await testPage.link('Select a location').click()
    await expect(testPage.savedLocationDropdown()).toBeFocused()

    // verify next page routing
    await testPage.savedLocationDropdown().click()
    await testPage.selectSavedLocation('Saved Location, UK')
    await testPage.clickButton('Add location')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)
  })

  test('should enter an address and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()
    await testPage.clickTab('Enter an address')

    // verify validation error
    await testPage.organisationNameField().fill('n'.repeat(41))
    await testPage.line1Field().fill('1 Manual Street')
    await testPage.postcodeField().fill('n'.repeat(13))
    await testPage.clickButton('Add location')
    await testPage.link('Description must be 40 characters or fewer').click()
    await expect(testPage.organisationNameField()).toBeFocused()
    await testPage.link('Enter town or city').click()
    await expect(testPage.cityField()).toBeFocused()
    await testPage.link('Postcode must be 12 characters or fewer').click()
    await expect(testPage.postcodeField()).toBeFocused()

    // verify next page routing
    await testPage.organisationNameField().fill('Org Name')
    await testPage.postcodeField().fill('RS1 34T')
    await testPage.cityField().fill('Manual City')
    await testPage.clickButton('Add location')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)
  })

  test('should enter an area and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()
    await testPage.clickTab('Enter an area')

    // verify validation error
    await testPage.clickButton('Add location')
    await testPage.link('Enter a description of the area').click()
    await expect(testPage.areaField()).toBeFocused()

    // verify next page routing
    await testPage.areaField().fill('Some Area')
    await testPage.clickButton('Add location')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)
  })

  test('should proceed to match-absences-and-locations if there are multiple locations', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()

    // add two locations
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickButton('Add location')

    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address 2, RS1 34T')
    await testPage.clickButton('Add location')

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/match-absences-and-locations/)
  })
})
