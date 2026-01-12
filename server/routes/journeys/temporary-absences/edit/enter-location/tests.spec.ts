import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
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
import { EditTapOccurrenceEnterLocationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/temporary-absences/edit/enter-location unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absences/edit/enter-location`)
  })
})

test.describe('/temporary-absences/edit/enter-location', () => {
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
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/location`)
    await page.goto(`/${journeyId}/temporary-absences/edit/enter-location`)
  }

  test('should manually enter an address', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceEnterLocationPage(page).verifyContent()

    await expect(testPage.organisationNameField()).toBeVisible()
    await expect(testPage.line1Field()).toBeVisible()
    await expect(testPage.line2Field()).toBeVisible()
    await expect(testPage.cityField()).toBeVisible()
    await expect(testPage.countyField()).toBeVisible()
    await expect(testPage.postcodeField()).toBeVisible()
    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify validation error
    await testPage.line1Field().fill('1 Manual Street')
    await testPage.clickButton('Confirm and save')
    await testPage.link('Enter town or city').click()
    await expect(testPage.cityField()).toBeFocused()

    // verify next page routing
    await testPage.cityField().fill('Manual City')
    await testPage.clickButton('Confirm and save')
    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-occurrences/${occurrenceId}`, 'PUT')).toEqual([
      {
        type: 'ChangeOccurrenceLocation',
        location: {
          address: '1 Manual Street, Manual City',
        },
      },
    ])
  })
})
