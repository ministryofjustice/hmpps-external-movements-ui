import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import { stubSearchTapOccurrence } from '../../../integration_tests/mockApis/externalMovementsApi'
import { BrowseTapOccurrencesPage } from './test.page'

test.describe('/temporary-absences', () => {
  test.beforeAll(async () => {
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponents()])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should show search TAP occurrences page', async ({ page }) => {
    await stubSearchTapOccurrence('.*', {
      metadata: { totalElements: 26 },
      content: [
        {
          id: 'occurrence-id',
          authorisation: {
            id: uuidV4(),
            person: {
              personIdentifier: 'A9965EA',
              firstName: 'PRISONER-NAME',
              lastName: 'PRISONER-SURNAME',
              dateOfBirth: '1990-01-01',
              cellLocation: '2-1-005',
            },
            status: { code: 'APPROVED', description: 'Approved' },
            absenceType: {
              code: 'RR',
              description: 'Restricted ROTL (Release on Temporary Licence)',
            },
            absenceSubType: {
              code: 'RDR',
              description: 'RDR (Resettlement Day Release)',
              hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
            },
            absenceReasonCategory: { code: 'PW', description: 'Paid work' },
            absenceReason: { code: 'R15', description: 'IT and communication' },
            repeat: false,
          },
          absenceType: {
            code: 'RR',
            description: 'Restricted ROTL (Release on Temporary Licence)',
          },
          status: { code: 'SCHEDULED', description: 'Scheduled' },
          releaseAt: '2001-01-01T10:00:00',
          returnBy: '2001-01-01T17:30:00',
          location: { uprn: '1001', description: 'Random Street, UK' },
          accompaniedBy: { code: 'U', description: 'Unaccompanied' },
          transport: { code: 'CAR', description: 'Car' },
          isCancelled: false,
        },
      ],
    })
    await page.goto(`/temporary-absences?searchTerm=test&fromDate=01/01/2001&toDate=02/01/2001&status=SCHEDULED&page=2`)

    // verify page content
    const testPage = await new BrowseTapOccurrencesPage(page).verifyContent()

    // verify query strings are populated into filter fields
    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('test')
    await expect(testPage.fromDateField()).toBeVisible()
    await expect(testPage.fromDateField()).toHaveValue('01/01/2001')
    await expect(testPage.toDateField()).toBeVisible()
    await expect(testPage.toDateField()).toHaveValue('02/01/2001')
    await expect(testPage.statusDropdown()).toBeVisible()
    await expect(testPage.statusDropdown()).toHaveValue('SCHEDULED')

    // verify search results are rendered
    await expect(page.getByText('Showing 26 to 26 of 26 results')).toHaveCount(2)
    await testPage.verifyTableRow(1, [
      /Prisoner-Name Prisoner-Surname(.*)A9965EA/,
      '1 January 2001 at 10:00',
      '1 January 2001 at 17:30',
      'Restricted ROTL (Release on Temporary Licence)',
      'Random Street, UK',
      'Unaccompanied',
      'Car',
      'Scheduled',
    ])

    // verify validation error
    await testPage.fromDateField().fill('25/12/2001')
    await testPage.clickButton('Apply filters')
    await testPage.link('Enter a valid date range').click()
    await expect(testPage.fromDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view temporary absences.')).toBeVisible()
  })
})
