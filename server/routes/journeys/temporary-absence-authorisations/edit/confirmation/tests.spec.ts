import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationConfirmationPage } from './test.page'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { JourneyData } from '../../../../../@types/journeys'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/edit/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/confirmation`)
  })
})

test.describe('/temporary-absence-authorisations/edit/confirmation', () => {
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

  const startJourney = async (page: Page, journeyId: string, journeyData: Partial<JourneyData>) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/start-end-dates`)
    await injectJourneyData(page, journeyId, journeyData)
    await page.goto(`/${journeyId}/temporary-absence-authorisations/edit/confirmation`)
  }

  test('should show TAP authorisation date range changed confirmation', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      updateTapAuthorisation: {
        backUrl: `/temporary-absence-authorisations/${authorisationId}`,
        authorisation,
        result: {
          content: [
            {
              user: { username: 'USERNAME', name: 'User Name' },
              occurredAt: '2025-12-01T17:50:20.421301',
              domainEvents: ['person.temporary-absence-authorisation.date-range-changed'],
              changes: [{ propertyName: 'start', previous: '2025-12-02', change: '2025-12-01' }],
            },
          ],
        },
      },
    })

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmationPage(page).verifyContent()

    await expect(page.getByText('Absence date range changed')).toBeVisible()

    await testPage.verifyLink(
      'View this temporary absence',
      /temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )
    await testPage.verifyLink('View all temporary absences in Leeds (HMP)', /temporary-absence-authorisations\?/)
  })

  test('should show TAP authorisation cancelled confirmation', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      updateTapAuthorisation: {
        backUrl: `/temporary-absence-authorisations/${authorisationId}`,
        authorisation,
        result: {
          content: [
            {
              user: { username: 'USERNAME', name: 'User Name' },
              occurredAt: '2025-12-01T17:50:20.421301',
              domainEvents: ['person.temporary-absence-authorisation.cancelled'],
              changes: [{ propertyName: '', previous: '', change: '' }],
            },
          ],
        },
      },
    })

    // verify page content
    const testPage = await new EditTapAuthorisationConfirmationPage(page).verifyContent()

    await expect(page.getByText('Absence cancelled')).toBeVisible()

    await testPage.verifyLink('View all temporary absences in Leeds (HMP)', /temporary-absence-authorisations\?/)
    await testPage.verifyLink('Return to the DPS homepage', /localhost:3001$/)
  })
})
