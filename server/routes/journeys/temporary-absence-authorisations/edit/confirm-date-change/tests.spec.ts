import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubPutTapAuthorisation,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationConfirmDateChangePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { components } from '../../../../../@types/externalMovements'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/temporary-absence-authorisations/edit/confirm-date-change unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/confirm-date-change`)
  })
})

test.describe('/temporary-absence-authorisations/edit/confirm-date-change', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (
    page: Page,
    journeyId: string,
    authorisation: components['schemas']['TapAuthorisation'],
    newOccurrences: { start: string; end: string }[],
  ) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisation.id}/start-end-dates`)
    await injectJourneyData(page, journeyId, {
      updateTapAuthorisation: {
        authorisation,
        backUrl: 'back-url',
        start: '2001-01-01',
        end: '2001-01-06',
        newOccurrences,
      },
    })
    await page.goto(`/${journeyId}/temporary-absence-authorisations/edit/confirm-date-change`)
  }

  test('should confirm TAP date change and proceed to select location', async ({ page }) => {
    const journeyId = uuidV4()
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
      start: '2001-01-02',
      locations: [
        { uprn: 1001, description: 'Random Street, UK' },
        { uprn: 1002, description: 'Another Street, UK' },
      ],
    }

    await stubGetTapAuthorisation(authorisation)
    await startJourney(page, journeyId, authorisation, [
      { start: '2001-01-05T10:00:00', end: '2001-01-05T17:30:00' },
      { start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' },
    ])

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmDateChangePage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.continueButton()).toBeVisible()
    await expect(page.getByText('This will add new occurrences to the schedule.')).toBeVisible()
    await expect(page.getByText('will need to add new occurrences manually')).toHaveCount(0)

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if you want to change the dates').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/select-location/)
  })

  test('should confirm and save TAP date change when there is no new occurrences', async ({ page }) => {
    const journeyId = uuidV4()
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
      start: '2001-01-02',
      locations: [
        { uprn: 1001, description: 'Random Street, UK' },
        { uprn: 1002, description: 'Another Street, UK' },
      ],
    }

    await stubGetTapAuthorisation(authorisation)
    await stubPutTapAuthorisation(authorisationId, {
      content: [
        {
          user: { username: 'USERNAME', name: 'User Name' },
          occurredAt: '2025-12-01T17:50:20.421301',
          domainEvents: ['person.temporary-absence-authorisation.date-range-changed'],
          changes: [{ propertyName: 'start', previous: '2025-12-02', change: '2025-12-01' }],
        },
      ],
    })
    await startJourney(page, journeyId, authorisation, [])

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmDateChangePage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.button('Confirm')).toBeVisible()
    await expect(page.getByText('This will add new occurrences to the schedule.')).toHaveCount(0)
    await expect(page.getByText('will need to add new occurrences manually')).toBeVisible()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickButton('Confirm')

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)

    expect(
      await getApiBody(`/external-movements-api/temporary-absence-authorisations/${authorisationId}`, 'PUT'),
    ).toEqual([
      {
        actions: [
          {
            type: 'ChangeAuthorisationDateRange',
            start: '2001-01-01',
            end: '2001-01-06',
          },
        ],
      },
    ])
  })

  test('should confirm and save TAP date change when there is only one location', async ({ page }) => {
    const journeyId = uuidV4()
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
      start: '2001-01-02',
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    }

    await stubGetTapAuthorisation(authorisation)
    await stubPutTapAuthorisation(authorisationId, {
      content: [
        {
          user: { username: 'USERNAME', name: 'User Name' },
          occurredAt: '2025-12-01T17:50:20.421301',
          domainEvents: ['person.temporary-absence-authorisation.date-range-changed'],
          changes: [{ propertyName: 'start', previous: '2025-12-02', change: '2025-12-01' }],
        },
      ],
    })
    await startJourney(page, journeyId, authorisation, [{ start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' }])

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmDateChangePage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.button('Confirm')).toBeVisible()
    await expect(page.getByText('This will add new occurrences to the schedule.')).toBeVisible()
    await expect(page.getByText('will need to add new occurrences manually')).toHaveCount(0)

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickButton('Confirm')

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)

    expect(
      await getApiBody(`/external-movements-api/temporary-absence-authorisations/${authorisationId}`, 'PUT'),
    ).toEqual([
      {
        actions: [
          {
            type: 'ChangeAuthorisationDateRange',
            start: '2001-01-01',
            end: '2001-01-06',
          },
          {
            type: 'CreateOccurrences',
            occurrences: [
              {
                start: '2001-01-06T10:00:00',
                end: '2001-01-06T17:30:00',
                location: { uprn: 1001, description: 'Random Street, UK' },
              },
            ],
          },
        ],
      },
    ])
  })

  test('should cancel TAP date change and go back to TAP plan page', async ({ page }) => {
    const journeyId = uuidV4()
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
      start: '2001-01-02',
      locations: [
        { uprn: 1001, description: 'Random Street, UK' },
        { uprn: 1002, description: 'Another Street, UK' },
      ],
    }

    await stubGetTapAuthorisation(authorisation)
    await startJourney(page, journeyId, authorisation, [
      { start: '2001-01-05T10:00:00', end: '2001-01-05T17:30:00' },
      { start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' },
    ])

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmDateChangePage(page).verifyContent()

    // verify next page routing
    await testPage.noRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(
      /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )
  })
})
