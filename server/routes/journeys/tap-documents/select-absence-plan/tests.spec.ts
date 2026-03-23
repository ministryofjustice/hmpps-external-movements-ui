import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { stubSearchTapAuthorisation } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { SelectAbsencePlanPage } from './test.page'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTemplates } from '../../../../../integration_tests/mockApis/documentGenerationApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/tap-documents/select-absence-plan', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTemplates(),
      stubSearchTapAuthorisation({
        metadata: { totalElements: 27 },
        content: [
          {
            id: 'authorisation-id-1',
            person: {
              personIdentifier: 'A9965EA',
              firstName: 'PRISONER-NAME',
              lastName: 'PRISONER-SURNAME',

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
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should show select TAP plan page', async ({ page }) => {
    const journeyId = uuidV4()

    // start journey
    await page.goto(`/${journeyId}/tap-documents/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      createDocumentJourney: {
        documentGroup: 'TEMPORARY_ABSENCE',
        tapHomepageUrl: '/temporary-absence-home',
        selectTypeUrl: `/${journeyId}/tap-documents/select-document-type`,
        templateId: 'template-1',
      },
    })

    await page.goto(`/${journeyId}/tap-documents/select-absence-plan?page=2`)

    // verify page content
    const testPage = await new SelectAbsencePlanPage(page).verifyContent()

    await expect(page.getByText('Showing 26 to 27 of 27 total results')).toHaveCount(2)
    await testPage.verifyTableRow(1, [
      '1 January 2001',
      '1 January 2001',
      'Restricted ROTL (Release on Temporary Licence) > RDR (Resettlement Day Release) > Paid work > IT and communication',
      'Single',
      'Approved',
    ])
    await testPage.verifyTableRow(2, [
      '2 January 2001',
      '1 March 2001',
      'Police production',
      'Repeating (12 occurrences)',
      'To be reviewed',
    ])
    await expect(testPage.link('Select plan start on 1 January 2001')).toHaveAttribute(
      'href',
      new RegExp(
        `http://localhost:9091/document-generation-ui/download-document/template-1\\?prisonId=LEI&prisonNumber=${prisonNumber}&returnTo=http%3A%2F%2Flocalhost%3A3000%2Ftemporary-absence-home&backTo=http%3A%2F%2Flocalhost%3A3000%2F${journeyId}%2Ftap-documents%2Fselect-absence-plan%3Fpage%3D2%26history%3D.*&absenceId=authorisation-id-1`,
      ),
    )
    await expect(testPage.link('Select plan start on 2 January 2001')).toHaveAttribute(
      'href',
      new RegExp(
        `http://localhost:9091/document-generation-ui/download-document/template-1\\?prisonId=LEI&prisonNumber=${prisonNumber}&returnTo=http%3A%2F%2Flocalhost%3A3000%2Ftemporary-absence-home&backTo=http%3A%2F%2Flocalhost%3A3000%2F${journeyId}%2Ftap-documents%2Fselect-absence-plan%3Fpage%3D2%26history%3D.*&absenceId=authorisation-id-2`,
      ),
    )
  })
})
