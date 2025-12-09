import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { AddTapOccurrenceSearchLocationPage } from './test.page'
import { stubGetAddress, stubSearchAddresses } from '../../../../../../integration_tests/mockApis/osPlacesApi'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/add-occurrence/search-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/add-occurrence/search-location`)
  })
})

test.describe('/temporary-absence-authorisations/add-occurrence/search-location', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: { code: 'APPROVED', description: 'approved' },
    absenceType: {
      code: 'PP',
      description: 'Police production',
    },
    repeat: true,
    fromDate: '2001-01-02',
    toDate: '2001-01-05',
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'SCHEDULED', description: 'Scheduled' },
        releaseAt: '2001-01-02T10:00:00',
        returnBy: '2001-01-02T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  test.beforeAll(async () => {
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

    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubSearchAddresses('random', [address]),
      stubSearchAddresses('SW1H%209AJ', [address]), // query used by the module to check OS Places API availability
      stubGetAddress('1001', address),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-add-occurrence/${authorisationId}`)
    await injectJourneyData(page, journeyId, {
      addTapOccurrence: {
        authorisation,
        backUrl: '',
        startDate: '2001-01-03',
        startTime: '10:00',
        returnDate: '2001-01-03',
        returnTime: '17:30',
        locationOption: 'NEW',
      },
    })
    await page.goto(`/${journeyId}/temporary-absence-authorisations/add-occurrence/search-location`)
  }

  test('should search and select an address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AddTapOccurrenceSearchLocationPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify next page routing
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address, RS1 34T')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/comments/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.searchField()).toHaveValue('Address, RS1 34T')
  })
})
