import { expect, Page, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import {
  randomPrisonNumber,
  testSearchAddressResults,
  testTapAuthorisation,
} from '../../../../../integration_tests/data/testData'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubPostTapOccurrence,
} from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetAddress, stubSearchAddresses } from '../../../../../integration_tests/mockApis/osPlacesApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { AddTapOccurrenceSearchLocationPage } from './search-location/test.page'
import { AddTapOccurrenceSelectLocationPage } from './select-location/test.page'
import { AddTapOccurrenceCommentsPage } from './comments/test.page'
import { AddTapOccurrenceCheckAnswersPage } from './check-answers/test.page'
import { AddTapOccurrenceConfirmationPage } from './confirmation/test.page'
import { AddTapOccurrencePage } from './test.page'
import { getApiBody } from '../../../../../integration_tests/mockApis/wiremock'
import { AddTapOccurrenceEnterLocationPage } from './enter-location/test.page'

test.describe('/temporary-absence-authorisations/add-occurrence/e2e', () => {
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
    repeat: true,
    start: '2001-01-02',
    end: '2001-01-05',
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubPostTapOccurrence(authorisationId, { id: 'occurrence-id' }),
      stubSearchAddresses('random', testSearchAddressResults),
      stubSearchAddresses('SW1H%209AJ', testSearchAddressResults), // query used by the module to check OS Places API availability
      stubGetAddress('1003', testSearchAddressResults[2]!),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-add-occurrence/${authorisationId}`)
  }

  test('should create new occurrence with an existing address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const startPage = await new AddTapOccurrencePage(page).verifyContent()
    await startPage.startDateField().fill('3/1/2001')
    await startPage.startHourField().fill('12')
    await startPage.startMinuteField().fill('00')
    await startPage.endDateField().fill('3/1/2001')
    await startPage.endHourField().fill('13')
    await startPage.endMinuteField().fill('30')
    await startPage.clickContinue()

    const selectLocationPage = await new AddTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()
    await selectLocationPage.locationRadio().click()
    await selectLocationPage.clickContinue()

    const commentsPage = await new AddTapOccurrenceCommentsPage(page).verifyContent(/select-location/)
    await commentsPage.commentsInput().fill('new comments')
    await commentsPage.clickContinue()

    const checkAnswersPage = await new AddTapOccurrenceCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.clickButton('Confirm and save')

    await new AddTapOccurrenceConfirmationPage(page).verifyContent()

    expect(
      await getApiBody(`/external-movements-api/temporary-absence-authorisations/${authorisationId}/occurrences`),
    ).toEqual([
      {
        start: '2001-01-03T12:00:00',
        end: '2001-01-03T13:30:00',
        location: {
          description: 'Random Street, UK',
          uprn: 1001,
        },
        comments: 'new comments',
      },
    ])
  })

  test('should create new occurrence with a new searched address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const startPage = await new AddTapOccurrencePage(page).verifyContent()
    await startPage.startDateField().fill('3/1/2001')
    await startPage.startHourField().fill('12')
    await startPage.startMinuteField().fill('00')
    await startPage.endDateField().fill('3/1/2001')
    await startPage.endHourField().fill('13')
    await startPage.endMinuteField().fill('30')
    await startPage.clickContinue()

    const selectLocationPage = await new AddTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()
    await selectLocationPage.newLocationRadio().click()
    await selectLocationPage.clickContinue()

    const searchLocationPage = await new AddTapOccurrenceSearchLocationPage(page).verifyContent()
    await searchLocationPage.searchField().fill('random')
    await searchLocationPage.selectAddress('Address 3, RS1 34T')
    await searchLocationPage.clickContinue()

    const commentsPage = await new AddTapOccurrenceCommentsPage(page).verifyContent(/search-location/)
    await commentsPage.commentsInput().fill('new comments')
    await commentsPage.clickContinue()

    const checkAnswersPage = await new AddTapOccurrenceCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.clickButton('Confirm and save')

    await new AddTapOccurrenceConfirmationPage(page).verifyContent()

    expect(
      await getApiBody(`/external-movements-api/temporary-absence-authorisations/${authorisationId}/occurrences`),
    ).toEqual([
      {
        start: '2001-01-03T12:00:00',
        end: '2001-01-03T13:30:00',
        location: {
          address: 'Address 3',
          postcode: 'RS1 34T',
          uprn: 1003,
        },
        comments: 'new comments',
      },
    ])
  })

  test('should create new occurrence with a new entered address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const startPage = await new AddTapOccurrencePage(page).verifyContent()
    await startPage.startDateField().fill('3/1/2001')
    await startPage.startHourField().fill('12')
    await startPage.startMinuteField().fill('00')
    await startPage.endDateField().fill('3/1/2001')
    await startPage.endHourField().fill('13')
    await startPage.endMinuteField().fill('30')
    await startPage.clickContinue()

    const selectLocationPage = await new AddTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()
    await selectLocationPage.newLocationRadio().click()
    await selectLocationPage.clickContinue()

    const searchLocationPage = await new AddTapOccurrenceSearchLocationPage(page).verifyContent()
    await searchLocationPage.clickEnterManually()

    const enterLocationPage = await new AddTapOccurrenceEnterLocationPage(page).verifyContent()
    await enterLocationPage.line1Field().fill('1 Manual Street')
    await enterLocationPage.cityField().fill('Manual City')
    await enterLocationPage.clickContinue()

    const commentsPage = await new AddTapOccurrenceCommentsPage(page).verifyContent(/search-location/)
    await commentsPage.commentsInput().fill('new comments')
    await commentsPage.clickContinue()

    const checkAnswersPage = await new AddTapOccurrenceCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.clickButton('Confirm and save')

    await new AddTapOccurrenceConfirmationPage(page).verifyContent()

    expect(
      await getApiBody(`/external-movements-api/temporary-absence-authorisations/${authorisationId}/occurrences`),
    ).toEqual([
      {
        start: '2001-01-03T12:00:00',
        end: '2001-01-03T13:30:00',
        location: {
          address: '1 Manual Street, Manual City',
        },
        comments: 'new comments',
      },
    ])
  })

  test('can change new occurrence answers', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const startPage = await new AddTapOccurrencePage(page).verifyContent()
    await startPage.startDateField().fill('3/1/2001')
    await startPage.startHourField().fill('12')
    await startPage.startMinuteField().fill('00')
    await startPage.endDateField().fill('3/1/2001')
    await startPage.endHourField().fill('13')
    await startPage.endMinuteField().fill('30')
    await startPage.clickContinue()

    const selectLocationPage = await new AddTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()
    await selectLocationPage.locationRadio().click()
    await selectLocationPage.clickContinue()

    const commentsPage = await new AddTapOccurrenceCommentsPage(page).verifyContent(/select-location/)
    await commentsPage.commentsInput().fill('new comments')
    await commentsPage.clickContinue()

    const checkAnswersPage = await new AddTapOccurrenceCheckAnswersPage(page).verifyContent()

    await checkAnswersPage.clickLink('Change start date and time')
    await startPage.startHourField().fill('05')
    await startPage.endHourField().fill('09')
    await startPage.clickContinue()

    await checkAnswersPage.clickLink(/Change location$/)
    await selectLocationPage.newLocationRadio().click()
    await selectLocationPage.clickContinue()
    const searchLocationPage = await new AddTapOccurrenceSearchLocationPage(page).verifyContent()
    await searchLocationPage.clickEnterManually()
    const enterLocationPage = await new AddTapOccurrenceEnterLocationPage(page).verifyContent()
    await enterLocationPage.line1Field().fill('1 Manual Street')
    await enterLocationPage.cityField().fill('Manual City')
    await enterLocationPage.clickContinue()

    await checkAnswersPage.clickLink('Change comments')
    await commentsPage.commentsInput().fill('another comments')
    await commentsPage.clickContinue()

    await checkAnswersPage.clickButton('Confirm and save')
    await new AddTapOccurrenceConfirmationPage(page).verifyContent()

    expect(
      await getApiBody(`/external-movements-api/temporary-absence-authorisations/${authorisationId}/occurrences`),
    ).toEqual([
      {
        start: '2001-01-03T05:00:00',
        end: '2001-01-03T09:30:00',
        location: {
          address: '1 Manual Street, Manual City',
        },
        comments: 'another comments',
      },
    ])
  })
})
