import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { AddTapOccurrenceSelectLocationPage } from './test.page'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/add-occurrence/select-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/add-occurrence/select-location`)
  })
})

test.describe('/temporary-absence-authorisations/add-occurrence/select-location', () => {
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
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
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
      },
    })

    await page.goto(`/${journeyId}/temporary-absence-authorisations/add-occurrence/select-location`)
  }

  test('should select existing location and proceed to comments page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AddTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()

    await expect(testPage.locationRadio()).toBeVisible()
    await expect(testPage.locationRadio()).not.toBeChecked()
    await expect(testPage.newLocationRadio()).toBeVisible()
    await expect(testPage.newLocationRadio()).not.toBeChecked()
    await expect(testPage.button('Continue', true)).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a location where this occurrence will take place').click()
    await expect(testPage.locationRadio()).toBeFocused()

    // verify next page routing
    await testPage.locationRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/add-occurrence\/comments/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.locationRadio()).toBeChecked()
    await expect(testPage.newLocationRadio()).not.toBeChecked()
  })

  test('should select new location and proceed to search location page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AddTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()

    await expect(testPage.locationRadio()).toBeVisible()
    await expect(testPage.locationRadio()).not.toBeChecked()
    await expect(testPage.newLocationRadio()).toBeVisible()
    await expect(testPage.newLocationRadio()).not.toBeChecked()
    await expect(testPage.button('Continue', true)).toBeVisible()

    // verify next page routing
    await testPage.newLocationRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/add-occurrence\/search-location/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.locationRadio()).not.toBeChecked()
    await expect(testPage.newLocationRadio()).toBeChecked()
  })
})
