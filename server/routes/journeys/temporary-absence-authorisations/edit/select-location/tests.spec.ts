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
import { EditTapAuthorisationSelectLocationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { components } from '../../../../../@types/externalMovements'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/temporary-absence-authorisations/edit/select-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/select-location`)
  })
})

test.describe('/temporary-absence-authorisations/edit/select-location', () => {
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
    await page.goto(`/${journeyId}/temporary-absence-authorisations/edit/select-location`)
  }

  test('should select a location for new occurrences and save date change', async ({ page }) => {
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
    await startJourney(page, journeyId, authorisation, [
      { start: '2001-01-05T10:00:00', end: '2001-01-05T17:30:00' },
      { start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' },
    ])

    // verify page content
    const testPage = await new EditTapAuthorisationSelectLocationPage(page).verifyContent()

    await expect(testPage.radio('Random Street, UK')).toBeVisible()
    await expect(testPage.radio('Random Street, UK')).not.toBeChecked()
    await expect(testPage.radio('Another Street, UK')).toBeVisible()
    await expect(testPage.radio('Another Street, UK')).not.toBeChecked()
    await expect(testPage.radio('Across all of these locations')).toBeVisible()
    await expect(testPage.radio('Across all of these locations')).not.toBeChecked()
    await expect(testPage.continueButton()).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a location where the new occurrences will take place').click()
    await expect(testPage.radio('Random Street, UK')).toBeFocused()

    // verify next page routing
    await testPage.radio('Random Street, UK').click()
    await testPage.clickContinue()

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
                start: '2001-01-05T10:00:00',
                end: '2001-01-05T17:30:00',
                location: { uprn: 1001, description: 'Random Street, UK' },
              },
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

  test('should not show multi location option when there is only one new occurrence', async ({ page }) => {
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
    await startJourney(page, journeyId, authorisation, [{ start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' }])

    // verify page content
    const testPage = await new EditTapAuthorisationSelectLocationPage(page).verifyContent()

    await expect(testPage.radio('Random Street, UK')).toBeVisible()
    await expect(testPage.radio('Random Street, UK')).not.toBeChecked()
    await expect(testPage.radio('Another Street, UK')).toBeVisible()
    await expect(testPage.radio('Another Street, UK')).not.toBeChecked()
    await expect(testPage.radio('Across all of these locations')).toHaveCount(0)
    await expect(testPage.continueButton()).toBeVisible()

    // verify next page routing
    await testPage.radio('Random Street, UK').click()
    await testPage.clickContinue()

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

  test('should select multiple locations for new occurrences and proceed to match occurrences and locations', async ({
    page,
  }) => {
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
      { start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' },
      { start: '2001-01-06T10:00:00', end: '2001-01-06T17:30:00' },
    ])

    // verify page content
    const testPage = await new EditTapAuthorisationSelectLocationPage(page).verifyContent()

    // verify next page routing
    await testPage.radio('Across all of these locations').click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/match-absences-and-locations/)
  })
})
