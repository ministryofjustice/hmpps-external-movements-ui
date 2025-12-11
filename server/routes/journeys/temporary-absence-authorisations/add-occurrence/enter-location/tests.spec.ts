import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { AddTapOccurrenceEnterLocationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/add-occurrence/enter-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/add-occurrence/enter-location`)
  })
})

test.describe('/temporary-absence-authorisations/add-occurrence/enter-location', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
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
    await page.goto(`/${journeyId}/temporary-absence-authorisations/add-occurrence/enter-location`)
  }

  test('should manually enter an address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AddTapOccurrenceEnterLocationPage(page).verifyContent()

    await expect(testPage.organisationNameField()).toBeVisible()
    await expect(testPage.line1Field()).toBeVisible()
    await expect(testPage.line2Field()).toBeVisible()
    await expect(testPage.cityField()).toBeVisible()
    await expect(testPage.countyField()).toBeVisible()
    await expect(testPage.postcodeField()).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.line1Field().fill('1 Manual Street')
    await testPage.clickContinue()
    await testPage.link('Enter town or city').click()
    await expect(testPage.cityField()).toBeFocused()

    // verify next page routing
    await testPage.cityField().fill('Manual City')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/comments/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.line1Field()).toHaveValue('1 Manual Street')
    await expect(testPage.cityField()).toHaveValue('Manual City')
  })
})
