import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { AddTapOccurrenceCheckAnswersPage } from './test.page'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'

test.describe('/temporary-absence-authorisations/add-occurrence/check-answers', () => {
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
    accompaniedBy: { code: 'P', description: 'Police escort' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: '1001', description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'SCHEDULED', description: 'Scheduled' },
        releaseAt: '2001-01-02T10:00:00',
        returnBy: '2001-01-02T17:30:00',
        location: { uprn: '1001', description: 'Random Street, UK' },
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
        locationOption: 0,
        notes: 'new comments',
      },
    })

    await page.goto(`/${journeyId}/temporary-absence-authorisations/add-occurrence/check-answers`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AddTapOccurrenceCheckAnswersPage(page).verifyContent()

    await testPage.verifyAnswer('Start date and time', '3 January 2001 at 10:00')
    await testPage.verifyAnswer('End date and time', '3 January 2001 at 17:30')
    await testPage.verifyAnswer('Location', 'Random Street, UK')
    await testPage.verifyAnswer('Comments', 'new comments')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Accompanied')
    await testPage.verifyAnswer('Accompanied by', 'Police escort')
    await testPage.verifyAnswer('Transport', 'Car')

    await testPage.verifyLink('Change start date and time', /..\/add-occurrence#startDate/)
    await testPage.verifyLink('Change end date and time', /..\/add-occurrence#returnDate/)
    await testPage.verifyLink(/Change location$/, /select-location/)
    await testPage.verifyLink('Change comments', /comments/)

    await expect(testPage.button('Confirm and save')).toBeVisible()
  })
})
