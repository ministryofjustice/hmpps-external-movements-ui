import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import {
  stubGetAllAbsenceTypes,
  stubSearchTapOccurrence,
} from '../../../integration_tests/mockApis/externalMovementsApi'
import { BrowseTapOccurrencesPage } from './test.page'
import { testTapOccurrenceResult } from '../../../integration_tests/data/testData'

test.describe('/temporary-absences', () => {
  test.beforeAll(async () => {
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponents(), stubGetAllAbsenceTypes({ items: [] })])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should show search TAP occurrences page', async ({ page }) => {
    await stubSearchTapOccurrence('.*', {
      metadata: { totalElements: 26 },
      content: [testTapOccurrenceResult],
    })
    await page.goto(`/temporary-absences?searchTerm=test&start=01/01/2001&end=02/01/2001&status=SCHEDULED&page=2`)

    // verify page content
    const testPage = await new BrowseTapOccurrencesPage(page).verifyContent()

    // verify query strings are populated into filter fields
    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('test')
    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('01/01/2001')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('02/01/2001')
    await expect(testPage.statusCheckbox()).toBeChecked()

    // verify search results are rendered
    await expect(page.getByText('Showing 26 to 26 of 26 total results')).toHaveCount(2)
    await testPage.verifyTableRow(1, [
      /Prisoner-Name Prisoner-Surname(.*)A9965EA/,
      '1 January 2001 at 10:00',
      '1 January 2001 at 17:30',
      'Restricted ROTL (Release on Temporary Licence)',
      'Random Street, UK',
      'Scheduled',
    ])

    // verify validation error
    await testPage.startDateField().fill('25/12/2001')
    await testPage.clickButton('Apply filters')
    await testPage.link('Enter a valid date range').click()
    await expect(testPage.startDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view temporary absences.')).toBeVisible()
  })
})
