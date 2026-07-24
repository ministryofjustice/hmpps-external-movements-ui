import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import {
  randomPrisonNumber,
  testSearchAddressResults,
  testTapAuthorisation,
  testTapOccurrence,
} from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetLocations,
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapOccurrenceLocationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetAddress, stubSearchAddresses } from '../../../../../../integration_tests/mockApis/osPlacesApi'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/temporary-absences/edit/location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absences/edit/location`)
  })
})

test.describe('/temporary-absences/edit/location', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()
  const occurrenceId = uuidV4()

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

  const occurrence = {
    ...testTapOccurrence,
    id: occurrenceId,
    authorisation,
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubGetTapOccurrence(occurrence),
      stubPutTapOccurrence(occurrenceId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.temporary-absence.comments-changed'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
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
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/location`)
  }

  test('should search and select a UK address and proceed to confirmation page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceLocationPage(page).verifyContent()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select an address or postcode').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify next page routing
    await testPage.searchField().fill('random')
    await testPage.selectAddress('Address 3, RS1 34T')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-occurrences/${occurrenceId}`, 'PUT')).toEqual([
      {
        actions: [
          {
            type: 'ChangeOccurrenceLocation',
            location: {
              address: 'Address 3',
              postcode: 'RS1 34T',
              uprn: 1003,
            },
          },
        ],
      },
    ])
  })

  test('should search and select a location and proceed to confirmation page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceLocationPage(page).verifyContent()
    await testPage.clickTab('Select a saved location')

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a location').click()
    await expect(testPage.savedLocationDropdown()).toBeFocused()

    // verify next page routing
    await testPage.savedLocationDropdown().click()
    await testPage.selectSavedLocation('Saved Location, UK')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-occurrences/${occurrenceId}`, 'PUT')).toEqual([
      {
        actions: [
          {
            type: 'ChangeOccurrenceLocation',
            location: { uprn: 9999, address: 'Saved Location, UK' },
          },
        ],
      },
    ])
  })

  test('should enter an address and proceed to confirmation page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceLocationPage(page).verifyContent()
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

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-occurrences/${occurrenceId}`, 'PUT')).toEqual([
      {
        actions: [
          {
            type: 'ChangeOccurrenceLocation',
            location: {
              address: '1 Manual Street, Manual City',
              description: 'Org Name',
              postcode: 'RS1 34T',
            },
          },
        ],
      },
    ])
  })

  test('should enter an area and proceed to confirmation page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceLocationPage(page).verifyContent()
    await testPage.clickTab('Enter an area')

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter a description of the area').click()
    await expect(testPage.areaField()).toBeFocused()

    // verify next page routing
    await testPage.areaField().fill('Some Area')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-occurrences/${occurrenceId}`, 'PUT')).toEqual([
      {
        actions: [
          {
            type: 'ChangeOccurrenceLocation',
            location: { address: 'Some Area' },
          },
        ],
      },
    ])
  })
})
