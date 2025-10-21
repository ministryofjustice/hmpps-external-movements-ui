import { v4 as uuidV4 } from 'uuid'
import { test, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { CheckPatternPage } from './test.page'

test.describe('/add-temporary-absence/check-absences', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
    ])

    await signIn(page)
  })

  // TODO: add tests for rotating pattern
  test('should show freeform absences', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: true,
        fromDate: '2001-01-01',
        toDate: '2001-01-17',
        patternType: 'FREEFORM',
        freeFormPattern: [
          { startDate: '2001-01-01', startTime: '10:00', returnDate: '2001-01-01', returnTime: '17:30' },
          { startDate: '2001-01-16', startTime: '23:00', returnDate: '2001-01-17', returnTime: '04:30' },
        ],
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/check-absences`)

    // verify page content
    const testPage = await new CheckPatternPage(page).verifyContent()

    await testPage.verifyLink(
      'Change dates and times (Week starting Monday, 1 January 2001)',
      /select-days-and-times\/1/,
    )
    await testPage.verifyAnswer('Monday, 1 January', /Release: 10:00(.+)?Return: 17:30/)

    await testPage.verifyLink('Add absence (Week starting Monday, 8 January 2001)', /select-days-and-times\/2/)
    expect(page.getByText('No absence entered')).toBeVisible()

    await testPage.verifyLink(
      'Change dates and times (Week starting Monday, 15 January 2001)',
      /select-days-and-times\/3/,
    )
    await testPage.verifyAnswer(/Tuesday, 16 January to(.+)?Wednesday, 17 January/, /Release: 23:00(.+)?Return: 04:30/)
  })

  test('should show weekly absences', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: true,
        fromDate: '2001-01-01',
        toDate: '2001-01-17',
        patternType: 'WEEKLY',
        weeklyPattern: [
          { day: 0, overnight: false, startTime: '10:00', returnTime: '17:30' },
          { day: 2, overnight: true, startTime: '23:00', returnTime: '04:30' },
        ],
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/check-absences`)

    // verify page content
    const testPage = await new CheckPatternPage(page).verifyContent()

    await testPage.verifyAnswer('Monday, 1 January', /Release: 10:00(.+)?Return: 17:30/)
    await testPage.verifyAnswer('Monday, 8 January', /Release: 10:00(.+)?Return: 17:30/)
    await testPage.verifyAnswer('Monday, 15 January', /Release: 10:00(.+)?Return: 17:30/)

    await testPage.verifyAnswer(/Wednesday, 3 January to(.+)?Thursday, 4 January/, /Release: 23:00(.+)?Return: 04:30/)
    await testPage.verifyAnswer(/Wednesday, 10 January to(.+)?Thursday, 11 January/, /Release: 23:00(.+)?Return: 04:30/)
    expect(await page.getByText(/Wednesday, 17 January to(.+)?Thursday, 18 January/)).toHaveCount(0)

    await testPage.verifyLink('Go back to change this schedule', /select-days-times-weekly/)
  })
})
