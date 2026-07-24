import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import {
  randomPrisonNumber,
  testSearchAddressResults,
  testTapAuthorisation,
} from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetLocations,
  stubGetTapAuthorisation,
} from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { TapLocationPage } from './test.page'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetAddress, stubSearchAddresses } from '../../../../../integration_tests/mockApis/osPlacesApi'

test.describe('/add-temporary-absence/location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/location`)
  })
})

test.describe('/add-temporary-absence/location', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',

      cellLocation: '2-1-005',
    },
    repeat: true,
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubSearchAddresses('random', testSearchAddressResults),
      stubSearchAddresses('SW1H%209AJ', testSearchAddressResults), // query used by the module to check OS Places API availability
      stubGetAddress('1003', testSearchAddressResults[2]!),
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
        repeat: false,
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/location`)
  }

  test('should search and select a UK address and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new TapLocationPage(page).verifyContent()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify next page routing
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address 3, RS1 34T')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.searchField()).toHaveValue('Address 3, RS1 34T')
  })

  test('should search and select a location and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new TapLocationPage(page).verifyContent()
    await testPage.clickTab('Select a saved location')

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a location').click()
    await expect(testPage.savedLocationDropdown()).toBeFocused()

    // verify next page routing
    await testPage.savedLocationDropdown().click()
    await testPage.selectSavedLocation('Saved Location, UK')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    // verify input values are persisted
    await testPage.clickLink(/^Back$/)
    await expect(testPage.savedLocationDropdown()).toHaveValue('Saved Location, UK')
  })

  test('should enter an address and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new TapLocationPage(page).verifyContent()
    await testPage.clickTab('Enter an address')

    // verify validation error
    await testPage.organisationNameField().fill('n'.repeat(41))
    await testPage.line1Field().fill('1 Manual Street')
    await testPage.postcodeField().fill('n'.repeat(13))
    await testPage.clickContinue()
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
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    // verify input values are persisted
    await testPage.clickLink(/^Back$/)
    await expect(testPage.organisationNameField()).toHaveValue('Org Name')
    await expect(testPage.postcodeField()).toHaveValue('RS1 34T')
    await expect(testPage.cityField()).toHaveValue('Manual City')
  })

  test('should enter an area and proceed to accompanied-or-unaccompanied page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new TapLocationPage(page).verifyContent()
    await testPage.clickTab('Enter an area')

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter a description of the area').click()
    await expect(testPage.areaField()).toBeFocused()

    // verify next page routing
    await testPage.areaField().fill('Some Area')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    // verify input values are persisted
    await testPage.clickLink(/^Back$/)
    await expect(testPage.areaField()).toHaveValue('Some Area')
  })
})
