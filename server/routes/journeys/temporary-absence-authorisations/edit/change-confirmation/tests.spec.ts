import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetAllAbsenceTypes,
  stubGetTapAuthorisation,
  stubPutTapAuthorisation,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationChangeConfirmationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { JourneyData } from '../../../../../@types/journeys'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'

test.describe('/temporary-absence-authorisations/edit/change-confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/change-confirmation`)
  })
})

test.describe('/temporary-absence-authorisations/edit/change-confirmation', () => {
  const prisonNumber = randomPrisonNumber()

  const authorisation = {
    ...testTapAuthorisation,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    absenceType: {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
    },
    absenceSubType: { code: 'SPL', description: 'SPL (Special Purpose Licence)' },
    absenceReason: { code: 'C3', description: 'Death or funeral' },
    repeat: false,
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'SCHEDULED', description: 'Scheduled' },
        start: '2001-01-02T10:00:00',
        end: '2001-01-02T17:30:00',
        location: { uprn: 1001, address: 'Random Street, UK' },
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
      stubGetAllAbsenceTypes(),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (
    page: Page,
    journeyId: string,
    authorisationId: string,
    journeyData: Partial<JourneyData>,
  ) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/absence-type`)
    await injectJourneyData(page, journeyId, journeyData)
    await page.goto(`/${journeyId}/temporary-absence-authorisations/edit/change-confirmation`)
  }

  test('should confirm and save absence categorisation', async ({ page }) => {
    const authorisationId = uuidV4()

    await stubGetTapAuthorisation({
      ...authorisation,
      id: authorisationId,
    })

    await stubPutTapAuthorisation(authorisationId, {
      content: [
        {
          user: { username: 'USERNAME', name: 'User Name' },
          occurredAt: '2025-12-01T17:50:20.421301',
          domainEvents: ['person.temporary-absence-authorisation.recategorised'],
          changes: [{ propertyName: '', previous: '', change: '' }],
        },
      ],
    })

    const journeyId = uuidV4()
    await startJourney(page, journeyId, authorisationId, {
      updateTapAuthorisation: {
        backUrl: 'back-url',
        authorisation: { ...authorisation, id: authorisationId },
        absenceType: { code: 'PP', description: 'Police production' },
      },
    })

    // verify page content
    const testPage = await new EditTapAuthorisationChangeConfirmationPage(page).verifyContent()

    await expect(testPage.goBackLink()).toBeVisible()
    await expect(testPage.goBackLink()).toHaveAttribute(
      'href',
      /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )

    await expect(
      page.getByText(
        'This will change categorisation from Restricted ROTL (Release on Temporary Licence) - SPL (Special Purpose Licence) - Death or funeral to Police production.',
      ),
    ).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)
  })

  test('should confirm and save new location', async ({ page }) => {
    const authorisationId = uuidV4()

    await stubGetTapAuthorisation({
      ...authorisation,
      id: authorisationId,
    })

    await stubPutTapOccurrence('occurrence-id-1', {
      content: [
        {
          user: { username: 'USERNAME', name: 'User Name' },
          occurredAt: '2025-12-01T17:50:20.421301',
          domainEvents: ['person.temporary-absence.relocated'],
          changes: [{ propertyName: '', previous: '', change: '' }],
        },
      ],
    })

    const journeyId = uuidV4()
    await startJourney(page, journeyId, authorisationId, {
      updateTapAuthorisation: {
        backUrl: 'back-url',
        authorisation: { ...authorisation, id: authorisationId },
        location: { line1: '42 New Street', city: 'New City' },
      },
    })

    // verify page content
    const testPage = await new EditTapAuthorisationChangeConfirmationPage(page).verifyContent()

    await expect(testPage.goBackLink()).toBeVisible()
    await expect(testPage.goBackLink()).toHaveAttribute(
      'href',
      /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )

    await expect(
      page.getByText('This will change location from Random Street, UK to 42 New Street, New City.'),
    ).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)
  })
})
