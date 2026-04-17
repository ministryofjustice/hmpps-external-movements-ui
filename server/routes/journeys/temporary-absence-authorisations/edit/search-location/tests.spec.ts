import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import {
  randomPrisonNumber,
  testSearchAddressResults,
  testTapAuthorisation,
} from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationSearchLocationPage } from './test.page'
import { stubGetAddress, stubSearchAddresses } from '../../../../../../integration_tests/mockApis/osPlacesApi'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/edit/search-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/search-location`)
  })
})

test.describe('/temporary-absence-authorisations/edit/search-location', () => {
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
      stubGetAddress('1001', testSearchAddressResults[0]!),
      stubGetTapAuthorisation(authorisation),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/search-location`)
  }

  test('should search and select an address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapAuthorisationSearchLocationPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.continueButton()).toBeVisible()
    await expect(testPage.link('Enter a location manually')).toBeVisible()
    await expect(testPage.link('Enter a location manually')).toHaveAttribute('href', /enter-location/)

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify next page routing
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/change-confirmation/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.searchField()).toHaveValue('Address, RS1 34T')
  })
})
