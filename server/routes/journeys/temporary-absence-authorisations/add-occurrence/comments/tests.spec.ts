import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { AddTapOccurrenceCommentsPage } from './test.page'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'

test.describe('/temporary-absence-authorisations/add-occurrence/comments', () => {
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
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'SCHEDULED', description: 'Scheduled' },
        releaseAt: '2001-01-02T10:00:00',
        returnBy: '2001-01-02T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
    notes: 'existing comments',
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

  const startJourney = async (page: Page, journeyId: string, location: 'NEW' | number) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-add-occurrence/${authorisationId}`)

    await injectJourneyData(page, journeyId, {
      addTapOccurrence: {
        authorisation,
        backUrl: '',
        startDate: '2001-01-03',
        startTime: '10:00',
        returnDate: '2001-01-03',
        returnTime: '17:30',
        locationOption: location,
      },
    })

    await page.goto(`/${journeyId}/temporary-absence-authorisations/add-occurrence/comments`)
  }

  test('should try remove default comments after selecting location', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, 0)

    // verify page content
    const testPage = await new AddTapOccurrenceCommentsPage(page).verifyContent(/select-location/)

    await expect(testPage.commentsInput()).toBeVisible()
    await expect(testPage.commentsInput()).toHaveValue('existing comments')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.commentsInput().fill('n'.repeat(4001))
    await testPage.clickContinue()
    await testPage.link('Enter 4000 or fewer characters').click()
    await expect(testPage.commentsInput()).toBeFocused()

    // verify next page routing
    await testPage.commentsInput().clear()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/add-occurrence\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.commentsInput()).toHaveValue('')
  })

  test('should try edit comments after entering a new location', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, 'NEW')

    // verify page content
    const testPage = await new AddTapOccurrenceCommentsPage(page).verifyContent(/search-location/)

    await expect(testPage.commentsInput()).toBeVisible()
    await expect(testPage.commentsInput()).toHaveValue('existing comments')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify next page routing
    await testPage.commentsInput().fill('new comments')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/add-occurrence\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.commentsInput()).toHaveValue('new comments')
  })
})
