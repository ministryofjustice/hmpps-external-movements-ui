import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { RotatingReleaseReturnTimesPage } from './test.page'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'

test.describe('/add-temporary-absence/rotating-release-return-times', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.allSettled([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        rotatingPatternSubJourney: {
          intervals: [
            { count: 1, type: 'Scheduled days' },
            { count: 2, type: 'Scheduled nights' },
            { count: 3, type: 'Scheduled days' },
            { count: 4, type: 'Rest days' },
          ],
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/rotating-release-return-times`)
  }

  test('happy path (differing times)', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new RotatingReleaseReturnTimesPage(page).verifyContent()

    // Should be set up with 6 entry fields
    for (let i = 0; i < 6; i += 1) {
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toBeVisible()
      await expect(testPage.timeEntry(i, 'release', 'Minute')).toBeVisible()
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toBeVisible()
      await expect(testPage.timeEntry(i, 'return', 'Minute')).toBeVisible()
    }

    expect(await testPage.page.getByText('Release time').count()).toBe(6)

    // Check order of Working X headings
    await expect(testPage.page.getByRole('heading').nth(1)).toContainText('Working day 1')
    await expect(testPage.page.getByRole('heading').nth(2)).toContainText('Working night 1')
    await expect(testPage.page.getByRole('heading').nth(3)).toContainText('Working night 2')
    await expect(testPage.page.getByRole('heading').nth(4)).toContainText('Working day 2')
    await expect(testPage.page.getByRole('heading').nth(5)).toContainText('Working day 3')
    await expect(testPage.page.getByRole('heading').nth(6)).toContainText('Working day 4')

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await testPage.clickContinue()

    // Validation empty messages
    for (let i = 0; i < 6; i += 1) {
      await testPage.errorEmptyReleaseTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toBeFocused()

      await testPage.errorEmptyReturnTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toBeFocused()
    }

    // Validation empty minute messages
    for (let i = 0; i < 6; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill('1')
      await testPage.timeEntry(i, 'release', 'Minute').fill('')

      await testPage.timeEntry(i, 'return', 'Hour').fill('1')
      await testPage.timeEntry(i, 'return', 'Minute').fill('')
    }

    await testPage.clickContinue()

    await expect(testPage.errorEmptyReleaseTime()).toHaveCount(6)
    await expect(testPage.errorEmptyReturnTime()).toHaveCount(6)

    // Validation invalid messages
    for (let i = 0; i < 6; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill('24')
      await testPage.timeEntry(i, 'release', 'Minute').fill('61')

      await testPage.timeEntry(i, 'return', 'Hour').fill('24')
      await testPage.timeEntry(i, 'return', 'Minute').fill('61')
    }

    await testPage.clickContinue()

    for (let i = 0; i < 6; i += 1) {
      await testPage.errorInvalidReleaseTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toBeFocused()

      await testPage.errorInvalidReturnTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toBeFocused()
    }

    // Validation return after release (day only)
    for (let i = 0; i < 6; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill('2')
      await testPage.timeEntry(i, 'release', 'Minute').fill('2')

      await testPage.timeEntry(i, 'return', 'Hour').fill('1')
      await testPage.timeEntry(i, 'return', 'Minute').fill('1')
    }

    await testPage.clickContinue()

    await expect(testPage.errorReturnBeforeRelease()).toHaveCount(4)

    for (let i = 0; i < 4; i += 1) {
      await testPage.errorReturnBeforeRelease().nth(i).click()
      // There are two night entries after the first day - so skip these in the assert
      await expect(testPage.timeEntry(i === 0 ? 0 : i + 2, 'return', 'Hour')).toBeFocused()
    }

    // Verify data is interpretted correctly
    for (let i = 0; i < 6; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill(String(i + 1))
      await testPage.timeEntry(i, 'release', 'Minute').fill(String(i + 21))

      await testPage.timeEntry(i, 'return', 'Hour').fill(String((i + 1) * 2))
      await testPage.timeEntry(i, 'return', 'Minute').fill(String(i + 41))
    }

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/check-absences/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    for (let i = 0; i < 6; i += 1) {
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toHaveValue(String(i + 1).padStart(2, '0'))
      await expect(testPage.timeEntry(i, 'release', 'Minute')).toHaveValue(String(i + 21))

      await expect(testPage.timeEntry(i, 'return', 'Hour')).toHaveValue(String((i + 1) * 2).padStart(2, '0'))
      await expect(testPage.timeEntry(i, 'return', 'Minute')).toHaveValue(String(i + 41))
    }
  })

  test('happy path (same times)', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        rotatingPatternSubJourney: {
          isSameTime: true,
          intervals: [
            { count: 1, type: 'Scheduled days' },
            { count: 2, type: 'Scheduled nights' },
            { count: 3, type: 'Scheduled days' },
            { count: 4, type: 'Rest days' },
          ],
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/rotating-release-return-times`)

    // verify page content
    const testPage = await new RotatingReleaseReturnTimesPage(page).verifyContent()

    // Should be set up with 2 entry fields
    for (let i = 0; i < 2; i += 1) {
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toBeVisible()
      await expect(testPage.timeEntry(i, 'release', 'Minute')).toBeVisible()
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toBeVisible()
      await expect(testPage.timeEntry(i, 'return', 'Minute')).toBeVisible()
    }

    expect(await testPage.page.getByText('Release time').count()).toBe(2)

    // Check order of Working X headings
    await expect(testPage.page.getByRole('heading').nth(1)).toContainText('Working days')
    await expect(testPage.page.getByRole('heading').nth(2)).toContainText('Working nights')

    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation errors
    await testPage.clickContinue()

    // Validation empty messages
    for (let i = 0; i < 2; i += 1) {
      await testPage.errorEmptyReleaseTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toBeFocused()

      await testPage.errorEmptyReturnTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toBeFocused()
    }

    // Validation invalid messages
    for (let i = 0; i < 2; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill('24')
      await testPage.timeEntry(i, 'release', 'Minute').fill('61')

      await testPage.timeEntry(i, 'return', 'Hour').fill('24')
      await testPage.timeEntry(i, 'return', 'Minute').fill('61')
    }

    await testPage.clickContinue()

    for (let i = 0; i < 2; i += 1) {
      await testPage.errorInvalidReleaseTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toBeFocused()

      await testPage.errorInvalidReturnTime().nth(i).click()
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toBeFocused()
    }

    // Validation return after release (day only)
    for (let i = 0; i < 2; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill('2')
      await testPage.timeEntry(i, 'release', 'Minute').fill('2')

      await testPage.timeEntry(i, 'return', 'Hour').fill('1')
      await testPage.timeEntry(i, 'return', 'Minute').fill('1')
    }

    await testPage.clickContinue()

    await expect(testPage.errorReturnBeforeRelease()).toHaveCount(1)
    await testPage.errorReturnBeforeRelease().click()
    await expect(testPage.timeEntry(0, 'return', 'Hour')).toBeFocused()

    // Verify data is interpretted correctly
    for (let i = 0; i < 2; i += 1) {
      await testPage.timeEntry(i, 'release', 'Hour').fill(String(i + 1))
      await testPage.timeEntry(i, 'release', 'Minute').fill(String(i + 21))

      await testPage.timeEntry(i, 'return', 'Hour').fill(String((i + 1) * 2))
      await testPage.timeEntry(i, 'return', 'Minute').fill(String(i + 41))
    }

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/check-absences/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    for (let i = 0; i < 2; i += 1) {
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toHaveValue(String(i + 1).padStart(2, '0'))
      await expect(testPage.timeEntry(i, 'release', 'Minute')).toHaveValue(String(i + 21))

      await expect(testPage.timeEntry(i, 'return', 'Hour')).toHaveValue(String((i + 1) * 2).padStart(2, '0'))
      await expect(testPage.timeEntry(i, 'return', 'Minute')).toHaveValue(String(i + 41))
    }

    // Go back and set same times to false

    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        rotatingPatternSubJourney: {
          isSameTime: false,
        },
      } as unknown as AddTemporaryAbsenceJourney,
    })

    await page.goto(`/${journeyId}/add-temporary-absence/rotating-release-return-times`)

    await expect(testPage.timeEntry(0, 'release', 'Hour')).toHaveValue('01')
    await expect(testPage.timeEntry(0, 'release', 'Minute')).toHaveValue('21')
    await expect(testPage.timeEntry(0, 'return', 'Hour')).toHaveValue('02')
    await expect(testPage.timeEntry(0, 'return', 'Minute')).toHaveValue('41')

    for (let i = 1; i < 3; i += 1) {
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toHaveValue('02')
      await expect(testPage.timeEntry(i, 'release', 'Minute')).toHaveValue('22')
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toHaveValue('04')
      await expect(testPage.timeEntry(i, 'return', 'Minute')).toHaveValue('42')
    }

    for (let i = 3; i < 6; i += 1) {
      await expect(testPage.timeEntry(i, 'release', 'Hour')).toHaveValue('01')
      await expect(testPage.timeEntry(i, 'release', 'Minute')).toHaveValue('21')
      await expect(testPage.timeEntry(i, 'return', 'Hour')).toHaveValue('02')
      await expect(testPage.timeEntry(i, 'return', 'Minute')).toHaveValue('41')
    }
  })

  test('should handle different schedule cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        rotatingPatternSubJourney: {
          intervals: [
            { count: 1, type: 'Scheduled days' },
            { count: 2, type: 'Rest days' },
          ],
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/rotating-release-return-times`)

    const testPage = new RotatingReleaseReturnTimesPage(page)
    await expect(testPage.page.getByRole('heading').nth(1)).toContainText('Working day 1')
    await expect(testPage.page.getByRole('heading')).toHaveCount(2)

    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        rotatingPatternSubJourney: {
          intervals: [
            { count: 1, type: 'Scheduled nights' },
            { count: 2, type: 'Rest days' },
          ],
        },
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/rotating-release-return-times`)

    await expect(testPage.page.getByRole('heading').nth(1)).toContainText('Working night 1')
    await expect(testPage.page.getByRole('heading')).toHaveCount(2)
  })
})
