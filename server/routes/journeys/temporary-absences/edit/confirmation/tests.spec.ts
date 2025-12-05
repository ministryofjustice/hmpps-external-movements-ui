import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapOccurrenceConfirmationPage } from './test.page'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { JourneyData } from '../../../../../@types/journeys'

test.describe('/temporary-absences/edit/confirmation', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()
  const occurrenceId = uuidV4()

  const authorisation = {
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: { code: 'PENDING', description: 'To be reviewed' },
    absenceType: {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
    },
    repeat: true,
    fromDate: '2001-01-01',
    toDate: '2001-01-01',
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id',
        status: { code: 'PENDING', description: 'To be reviewed' },
        releaseAt: '2001-01-01T10:00:00',
        returnBy: '2001-01-01T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  const occurrence = {
    id: occurrenceId,
    authorisation,
    status: { code: 'SCHEDULED', description: 'Scheduled' },
    releaseAt: '2001-01-01T10:00:00',
    returnBy: '2001-01-01T17:30:00',
    location: { uprn: 1001, description: 'Random Street, UK' },
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubGetTapOccurrence(occurrence),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string, journeyData: Partial<JourneyData>) => {
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/start-end-dates`)
    await injectJourneyData(page, journeyId, journeyData)
    await page.goto(`/${journeyId}/temporary-absences/edit/confirmation`)
  }

  test('should show TAP occurrence rescheduled', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      updateTapOccurrence: {
        backUrl: `/temporary-absences/${occurrenceId}`,
        authorisation,
        occurrence,
        result: {
          content: [
            {
              user: { username: 'USERNAME', name: 'User Name' },
              occurredAt: '2025-12-01T17:50:20.421301',
              domainEvents: ['person.temporary-absence.rescheduled'],
              changes: [{ propertyName: '', previous: '', change: '' }],
            },
          ],
        },
      },
    })

    // verify page content
    const testPage = await new EditTapOccurrenceConfirmationPage(page).verifyContent()

    await expect(page.getByText('Absence rescheduled')).toBeVisible()

    await testPage.verifyLink(
      'View this occurrence',
      /temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )
    await testPage.verifyLink(
      'View this temporary absence',
      /temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )
    await testPage.verifyLink('View all temporary absence occurrences in Leeds (HMP)', /temporary-absences\?/)
  })

  test('should show TAP occurrence cancelled confirmation', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      updateTapOccurrence: {
        backUrl: `/temporary-absences/${occurrenceId}`,
        authorisation,
        occurrence,
        result: {
          content: [
            {
              user: { username: 'USERNAME', name: 'User Name' },
              occurredAt: '2025-12-01T17:50:20.421301',
              domainEvents: ['person.temporary-absence.cancelled'],
              changes: [{ propertyName: '', previous: '', change: '' }],
            },
          ],
        },
      },
    })

    // verify page content
    const testPage = await new EditTapOccurrenceConfirmationPage(page).verifyContent()

    await expect(page.getByText('Absence cancelled')).toBeVisible()

    await testPage.verifyLink(
      'View this temporary absence',
      /temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )
    await testPage.verifyLink('View all temporary absence occurrences in Leeds (HMP)', /temporary-absences\?/)
    await testPage.verifyLink('Return to the DPS homepage', /localhost:3001$/)
  })
})
