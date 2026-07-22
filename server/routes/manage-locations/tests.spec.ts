import { test, expect } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import { ManageLocationsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetAddress, stubSearchAddresses } from '../../../integration_tests/mockApis/osPlacesApi'
import { testSearchAddressResults } from '../../../integration_tests/data/testData'
import { stubGetLocations, stubPutLocations } from '../../../integration_tests/mockApis/externalMovementsApi'
import { getApiBody } from '../../../integration_tests/mockApis/wiremock'

test.describe('/manage-locations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/manage-locations')
  })
})

test.describe('/manage-locations', () => {
  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubSearchAddresses('random', testSearchAddressResults),
      stubSearchAddresses('SW1H%209AJ', testSearchAddressResults), // query used by the module to check OS Places API availability
      stubGetAddress('1001', testSearchAddressResults[0]!),
      stubGetLocations('LEI', {
        version: 'version',
        locations: [{ uprn: 9999, description: 'Saved Location, UK' }],
      }),
      stubPutLocations(),
    ])
  })

  test('should search and add a UK address to saved locations', async ({ page }) => {
    await signIn(page)
    await page.goto(`/manage-locations`)

    const testPage = await new ManageLocationsPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('')

    await expect(testPage.link('Remove Saved Location, UK')).toHaveAttribute(
      'href',
      /manage-locations\/remove\?version=version&idx=0/,
    )

    // verify validation error
    await testPage.clickButton('Save')
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify next page routing
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickButton('Save')
    expect(page.url()).toMatch(/\/manage-locations/)

    await expect(page.getByText(`Location “Address, RS1 34T” added.`)).toBeVisible()

    expect(await getApiBody('/external-movements-api/prisons/LEI/temporary-absence-locations', 'PUT')).toContainEqual({
      version: 'version',
      locations: [
        {
          address: null,
          description: 'Saved Location, UK',
          postcode: null,
          uprn: 9999,
        },
        {
          address: 'Address',
          postcode: 'RS1 34T',
          uprn: 1001,
        },
      ],
    })
  })

  test('should enter and save an address to saved locations', async ({ page }) => {
    await signIn(page)
    await page.goto(`/manage-locations#enter-address`)

    const testPage = await new ManageLocationsPage(page).verifyContent()

    await expect(testPage.organisationNameField()).toBeVisible()
    await expect(testPage.line1Field()).toBeVisible()
    await expect(testPage.line2Field()).toBeVisible()
    await expect(testPage.cityField()).toBeVisible()
    await expect(testPage.countyField()).toBeVisible()
    await expect(testPage.postcodeField()).toBeVisible()
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.organisationNameField().fill('n'.repeat(41))
    await testPage.line1Field().fill('1 Manual Street')
    await testPage.postcodeField().fill('n'.repeat(13))
    await testPage.clickButton('Save')
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
    await testPage.clickButton('Save')
    expect(page.url()).toMatch(/\/manage-locations/)

    await expect(page.getByText(`Location “Org Name, 1 Manual Street, Manual City, RS1 34T” added.`)).toBeVisible()

    expect(await getApiBody('/external-movements-api/prisons/LEI/temporary-absence-locations', 'PUT')).toContainEqual({
      version: 'version',
      locations: [
        {
          address: null,
          description: 'Saved Location, UK',
          postcode: null,
          uprn: 9999,
        },
        {
          address: '1 Manual Street, Manual City',
          description: 'Org Name',
          postcode: 'RS1 34T',
        },
      ],
    })
  })

  test('should add an area to saved locations', async ({ page }) => {
    await signIn(page)
    await page.goto(`/manage-locations#enter-area`)

    const testPage = await new ManageLocationsPage(page).verifyContent()

    await expect(testPage.areaField()).toBeVisible()
    await expect(testPage.areaField()).toHaveValue('')

    // verify validation error
    await testPage.clickButton('Save')
    await testPage.link('Enter a description of the area').click()
    await expect(testPage.areaField()).toBeFocused()

    // verify next page routing
    await testPage.areaField().fill('Some Area')
    await testPage.clickButton('Save')
    expect(page.url()).toMatch(/\/manage-locations/)

    await expect(page.getByText(`Location “Some Area” added.`)).toBeVisible()

    expect(await getApiBody('/external-movements-api/prisons/LEI/temporary-absence-locations', 'PUT')).toContainEqual({
      version: 'version',
      locations: [
        {
          address: null,
          description: 'Saved Location, UK',
          postcode: null,
          uprn: 9999,
        },
        {
          address: 'Some Area',
        },
      ],
    })
  })
})
