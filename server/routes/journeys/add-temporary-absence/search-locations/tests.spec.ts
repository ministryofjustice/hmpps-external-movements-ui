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
import { SearchLocationsPage } from './test.page'
import { stubGetAddress, stubSearchAddresses } from '../../../../../integration_tests/mockApis/osPlacesApi'

test.describe('/add-temporary-absence/search-locations', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    const address = {
      addressString: 'Address',
      buildingName: '',
      subBuildingName: '',
      thoroughfareName: 'Random Street',
      dependentLocality: '',
      postTown: '',
      county: '',
      postcode: 'RS1 34T',
      country: 'E',
      uprn: 1001,
    }

    const address2 = {
      addressString: 'Address 2',
      buildingName: '',
      subBuildingName: '',
      thoroughfareName: 'Random Street',
      dependentLocality: '',
      postTown: '',
      county: '',
      postcode: 'RS1 34T',
      country: 'E',
      uprn: 1002,
    }

    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubSearchAddresses('random', [address, address2]),
      stubSearchAddresses('SW1H%209AJ', [address]), // query used by the module to check OS Places API availability
      stubGetAddress('1001', address),
      stubGetAddress('1002', address2),
    ])

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

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    await testPage.searchField().fill('xxx')
    await testPage.clickButton('Add location')
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // add multiple locations
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickButton('Add location')

    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address 2, RS1 34T')
    await testPage.clickButton('Add location')

    await expect(page.getByText('Address, RS1 34T')).toBeVisible()
    await expect(page.getByText('Address 2, RS1 34T')).toBeVisible()

    // validation error on duplicate address
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickButton('Add location')
    await testPage.link('    Enter and select an address that has not been already added').click()
    await expect(testPage.searchField()).toBeFocused()

    // remove an address
    await testPage.clickLink('Remove location 2')
    await expect(page.getByText('Address, RS1 34T')).toBeVisible()
    await expect(page.getByText('Address 2, RS1 34T')).toHaveCount(0)

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)
  })

  test('should proceed to match-absences-and-locations if there are multiple locations', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new SearchLocationsPage(page).verifyContent()

    // add multiple locations
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
