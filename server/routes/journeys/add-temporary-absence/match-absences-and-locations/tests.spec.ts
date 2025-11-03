import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { MatchAbsencesAndLocationsPage } from './test.page'

test.describe('/add-temporary-absence/match-absences-and-locations', () => {
  const prisonNumber = randomPrisonNumber()

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

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: true,
        patternType: 'FREEFORM',
        freeFormPattern: [
          { startDate: '2001-01-01', startTime: '10:00', returnDate: '2001-01-01', returnTime: '17:30' },
          { startDate: '2001-01-16', startTime: '23:00', returnDate: '2001-01-17', returnTime: '04:30' },
        ],
        locations: [
          { id: '1001', description: 'Address 1, P05T 60D' },
          { id: '1002', description: 'Address 2, P05T 60D' },
        ],
      },
    })
    await page.goto(`/${journeyId}/add-temporary-absence/match-absences-and-locations`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new MatchAbsencesAndLocationsPage(page).verifyContent()

    await expect(testPage.dropdown('Monday, 1 January (10:00 to 17:30)')).toBeVisible()
    await expect(testPage.dropdown('Tuesday, 16 January to Wednesday, 17 January (23:00 to 04:30)')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage
      .dropdown('Tuesday, 16 January to Wednesday, 17 January (23:00 to 04:30)')
      .selectOption('Address 1, P05T 60D')
    await testPage.clickContinue()
    await testPage.link('Select a location').click()
    await expect(testPage.dropdown('Monday, 1 January (10:00 to 17:30)')).toBeFocused()

    // verify next page routing
    await testPage.dropdown('Monday, 1 January (10:00 to 17:30)').selectOption('Address 2, P05T 60D')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dropdown('Monday, 1 January (10:00 to 17:30)')).toHaveValue('1')
    await expect(testPage.dropdown('Tuesday, 16 January to Wednesday, 17 January (23:00 to 04:30)')).toHaveValue('0')
  })
})
