import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import {
  stubGetAllAbsenceTypes,
  stubSearchTapAuthorisation,
} from '../../../integration_tests/mockApis/externalMovementsApi'
import { BrowseTapAuthorisationsPage } from './test.page'

test.describe('/temporary-absence-authorisations', () => {
  test.beforeAll(async () => {
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponents(), stubGetAllAbsenceTypes({ items: [] })])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should show search TAP occurrences page', async ({ page }) => {
    await stubSearchTapAuthorisation({
      metadata: { totalElements: 27 },
      content: [
        {
          id: 'authorisation-id-1',
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
          start: '2001-01-01',
          end: '2001-01-01',
          locations: [{ uprn: 1001, description: 'Random Street, UK' }],
          occurrenceCount: 1,
          absenceCategorisation:
            'Restricted ROTL (Release on Temporary Licence) > RDR (Resettlement Day Release) > Paid work > IT and communication',
        },
        {
          id: 'authorisation-id-2',
          person: {
            personIdentifier: 'A9965EB',
            firstName: 'ANOTHER',
            lastName: 'Name',
            dateOfBirth: '1990-01-01',
            cellLocation: '2-1-005',
          },
          status: { code: 'PENDING', description: 'To be reviewed' },
          absenceType: {
            code: 'PP',
            description: 'Police production',
          },
          repeat: true,
          start: '2001-01-02',
          end: '2001-03-01',
          locations: [{ uprn: 1001, description: 'Random Street, UK' }],
          occurrenceCount: 12,
          absenceCategorisation: 'Police production',
        },
      ],
    })
    await page.goto(
      `/temporary-absence-authorisations?searchTerm=test&start=01/01/2001&end=02/01/2001&page=2&status=APPROVED`,
    )

    // verify page content
    const testPage = await new BrowseTapAuthorisationsPage(page).verifyContent()

    // verify query strings are populated into filter fields
    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('test')
    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('01/01/2001')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('02/01/2001')
    await expect(testPage.statusCheckbox()).toBeChecked()

    // verify search results are rendered
    await expect(page.getByText('Showing 26 to 27 of 27 total results')).toHaveCount(2)
    await testPage.verifyTableRow(1, [
      /Prisoner-Name Prisoner-Surname(.*)A9965EA/,
      '1 January 2001',
      '1 January 2001',
      'Restricted ROTL (Release on Temporary Licence) > RDR (Resettlement Day Release) > Paid work > IT and communication',
      'Single',
      'Approved',
    ])
    await testPage.verifyTableRow(2, [
      /Another Name(.*)A9965EB/,
      '2 January 2001',
      '1 March 2001',
      'Police production',
      'Repeating (12 occurrences)',
      'To be reviewed',
    ])

    // verify validation error
    await testPage.startDateField().fill('25/12/2001')
    await testPage.clickButton('Apply filters')
    await testPage.link('Enter a valid date range').click()
    await expect(testPage.startDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view temporary absence plans.')).toBeVisible()
  })
})
