import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import {
  stubGetAbsenceCategoryFilters,
  stubSearchPrisonerTap,
} from '../../../integration_tests/mockApis/externalMovementsApi'
import { ViewPrisonerAbsencesPage } from './test.page'
import {
  randomPrisonNumber,
  testPrisonerDetails,
  testTapOccurrenceResult,
} from '../../../integration_tests/data/testData'
import { verifyAuditEvents } from '../../../integration_tests/steps/verifyAuditEvents'
import { stubGetPrisonerImage } from '../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { NotAuthorisedPage } from '../../../integration_tests/pages/NotAuthorisedPage'

test.describe(`/temporary-absence-schedule-enquiry`, () => {
  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetAbsenceCategoryFilters({
        types: [],
        subTypes: [],
        reasons: [],
        workTypes: [],
      }),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should show view prisoner absences page', async ({ page }) => {
    await stubSearchPrisonerTap(testPrisonerDetails.prisonerNumber, {
      metadata: { totalElements: 26 },
      content: [{ ...testTapOccurrenceResult, prison: { code: 'LEI', name: 'Leeds' } }],
    })
    await page.goto(
      `/temporary-absence-schedule-enquiry/${testPrisonerDetails.prisonerNumber}?start=01/01/2001&end=02/01/2001&status=SCHEDULED&page=2`,
    )

    // verify page content
    const testPage = await new ViewPrisonerAbsencesPage(page).verifyContent()

    // verify query strings are populated into filter fields
    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('01/01/2001')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('02/01/2001')
    await expect(testPage.statusCheckbox()).toBeChecked()

    // verify search results are rendered
    await expect(page.getByText('Showing 26 to 26 of 26 total results')).toHaveCount(2)
    await testPage.verifyTableRow(1, [
      '1 January 2001 at 10:00',
      '1 January 2001 at 17:30',
      'Restricted ROTL (Release on Temporary Licence) > RDR (Resettlement Day Release) > Paid work > IT and communication',
      'Random Street, UK',
      'Leeds',
      'Scheduled',
    ])

    // verify validation error
    await testPage.startDateField().fill('x')
    await testPage.clickButton('Apply filters')
    await testPage.link('Enter or select a valid start date from').click()
    await expect(testPage.startDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view temporary absences.')).toBeVisible()

    // verify audit event
    await verifyAuditEvents([
      {
        what: 'PAGE_VIEW',
        subjectType: 'PRISONER_ID',
        subjectId: testPrisonerDetails.prisonerNumber,
        details:
          '{"pageUrl":"/temporary-absence-schedule-enquiry/A9965EA?start=01%2F01%2F2001&end=02%2F01%2F2001&status=SCHEDULED&page=2","pageName":"TEMPORARY_ABSENCE_SCHEDULE_ENQUIRY","activeCaseLoadId":"LEI"}',
        service: 'hmpps-external-movements-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])
  })

  test('should show unauthorised error if prisoner is outside user caseload', async ({ page }) => {
    const prisonNumber = randomPrisonNumber()
    await stubGetPrisonerDetails({
      ...testPrisonerDetails,
      prisonerNumber: prisonNumber,
      prisonId: 'OUTSIDE',
    })
    await page.goto(
      `/temporary-absence-schedule-enquiry/${prisonNumber}?start=01/01/2001&end=02/01/2001&status=SCHEDULED&page=2`,
    )

    // verify page content
    await new NotAuthorisedPage(page).verifyContent()
  })
})
