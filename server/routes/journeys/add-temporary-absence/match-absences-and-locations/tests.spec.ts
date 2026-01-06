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
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/add-temporary-absence/match-absences-and-locations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/match-absences-and-locations`)
  })
})

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

  const startJourney = async (page: Page, journeyId: string, pattern: Partial<AddTemporaryAbsenceJourney>) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: true,
        locations: [
          { id: 1001, description: 'Address 1, P05T 60D' },
          { id: 1002, description: 'Address 2, P05T 60D' },
        ],
        ...pattern,
      },
    })
    await page.goto(`/${journeyId}/add-temporary-absence/match-absences-and-locations`)
  }

  test('should try all cases for FREEFORM pattern', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      patternType: 'FREEFORM',
      freeFormPattern: [
        { startDate: '2001-01-01', startTime: '10:00', returnDate: '2001-01-01', returnTime: '17:30' },
        { startDate: '2001-01-16', startTime: '23:00', returnDate: '2001-01-17', returnTime: '04:30' },
      ],
    })

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

  test('should show options for WEEKLY pattern', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      patternType: 'WEEKLY',
      start: '2001-01-01',
      end: '2001-01-18',
      weeklyPattern: [
        { day: 0, overnight: false, startTime: '10:00', returnTime: '17:30' },
        { day: 3, overnight: true, startTime: '23:00', returnTime: '04:30' },
      ],
    })

    // verify page content
    const testPage = await new MatchAbsencesAndLocationsPage(page).verifyContent()

    await expect(testPage.dropdown('Monday, 1 January (10:00 to 17:30)')).toBeVisible()
    await expect(testPage.dropdown('Thursday, 4 January to Friday, 5 January (23:00 to 04:30)')).toBeVisible()
    await expect(testPage.dropdown('Monday, 8 January (10:00 to 17:30)')).toBeVisible()
    await expect(testPage.dropdown('Thursday, 11 January to Friday, 12 January (23:00 to 04:30)')).toBeVisible()
    await expect(testPage.dropdown('Monday, 15 January (10:00 to 17:30)')).toBeVisible()
    await expect(testPage.dropdown('Thursday, 18 January to Friday, 19 January (23:00 to 04:30)')).toHaveCount(0)
    await expect(testPage.button('Continue')).toBeVisible()
  })

  test('should show options for SHIFT pattern', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, {
      patternType: 'SHIFT',
      start: '2001-01-01',
      end: '2001-01-09',
      shiftPattern: [
        {
          type: 'DAY',
          count: 1,
          startTime: '10:00',
          returnTime: '17:00',
        },
        {
          type: 'DAY',
          count: 1,
          startTime: '11:00',
          returnTime: '17:00',
        },
        {
          type: 'DAY',
          count: 1,
          startTime: '12:00',
          returnTime: '17:00',
        },
        {
          type: 'NIGHT',
          count: 1,
          startTime: '23:00',
          returnTime: '04:30',
        },
        {
          type: 'NIGHT',
          count: 1,
          startTime: '23:00',
          returnTime: '05:30',
        },
        { type: 'REST', count: 2 },
      ],
    })

    // verify page content
    const testPage = await new MatchAbsencesAndLocationsPage(page).verifyContent()

    await expect(testPage.dropdown('Monday, 1 January (10:00 to 17:00)')).toBeVisible()
    await expect(testPage.dropdown('Tuesday, 2 January (11:00 to 17:00)')).toBeVisible()
    await expect(testPage.dropdown('Wednesday, 3 January (12:00 to 17:00)')).toBeVisible()
    await expect(testPage.dropdown('Thursday, 4 January to Friday, 5 January (23:00 to 04:30)')).toBeVisible()
    await expect(testPage.dropdown('Friday, 5 January to Saturday, 6 January (23:00 to 05:30)')).toBeVisible()
    await expect(testPage.dropdown('Monday, 8 January (10:00 to 17:00)')).toBeVisible()
    await expect(testPage.dropdown('Tuesday, 9 January (11:00 to 17:00)')).toBeVisible()
    await expect(testPage.dropdown('Wednesday, 10 January (12:00 to 17:00')).toHaveCount(0)
    await expect(testPage.button('Continue')).toBeVisible()
  })
})
