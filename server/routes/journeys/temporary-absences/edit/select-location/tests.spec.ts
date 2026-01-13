import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import {
  randomPrisonNumber,
  testTapAuthorisation,
  testTapOccurrence,
} from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapOccurrenceSelectLocationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/temporary-absences/edit/select-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absences/edit/select-location`)
  })
})

test.describe('/temporary-absences/edit/select-location', () => {
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
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    repeat: true,
    locations: [
      { uprn: 1001, description: 'Random Street, UK' },
      { uprn: 1002, description: 'Another Street, UK' },
    ],
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
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/location`)
  }

  test('should select existing location and confirm to save change', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()

    await expect(testPage.locationRadio()).toBeVisible()
    await expect(testPage.locationRadio()).not.toBeChecked()
    await expect(testPage.newLocationRadio()).toBeVisible()
    await expect(testPage.newLocationRadio()).not.toBeChecked()
    await expect(testPage.button('Confirm and save', true)).toBeVisible()

    // verify validation error
    await testPage.clickButton('Confirm and save')
    await testPage.link('Select a location where this occurrence will take place').click()
    await expect(testPage.locationRadio()).toBeFocused()

    // verify next page routing
    await testPage.locationRadio().click()
    await testPage.clickButton('Confirm and save')

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-occurrences/${occurrenceId}`, 'PUT')).toEqual([
      {
        type: 'ChangeOccurrenceLocation',
        location: {
          description: 'Random Street, UK',
          uprn: 1001,
        },
      },
    ])
  })

  test('should select new location and proceed to search location page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceSelectLocationPage(page, 'Random Street, UK').verifyContent()

    await expect(testPage.locationRadio()).toBeVisible()
    await expect(testPage.locationRadio()).not.toBeChecked()
    await expect(testPage.newLocationRadio()).toBeVisible()
    await expect(testPage.newLocationRadio()).not.toBeChecked()
    await expect(testPage.button('Confirm and save', true)).toBeVisible()
    await expect(testPage.button('Continue', true)).not.toBeVisible()

    // verify next page routing
    await testPage.newLocationRadio().click()
    await expect(testPage.button('Continue', true)).toBeVisible()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/search-location/)

    // verify input values are persisted
    await testPage.clickLink(/^Back$/)
    await expect(testPage.locationRadio()).not.toBeChecked()
    await expect(testPage.newLocationRadio()).toBeChecked()
    await expect(testPage.button('Confirm and save', true)).not.toBeVisible()
    await expect(testPage.button('Continue', true)).toBeVisible()
  })
})
