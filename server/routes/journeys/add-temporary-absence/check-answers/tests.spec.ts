import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetAllAbsenceTypes,
  stubPostCreateTap,
} from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { AddTapCYAPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { verifyAuditEvents } from '../../../../../integration_tests/steps/verifyAuditEvents'

test.describe('/add-temporary-absence/check-answers unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/check-answers`)
  })
})

test.describe('/add-temporary-absence/check-answers', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubPostCreateTap(prisonNumber),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should show check answers for all fields', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'SR',
          description: 'Standard ROTL (Release on Temporary Licence)',
          nextDomain: 'ABSENCE_SUB_TYPE',
        },
        absenceSubType: {
          code: 'RDR',
          description: 'RDR (Resettlement Day Release)',
          hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
          nextDomain: 'ABSENCE_REASON_CATEGORY',
        },
        reasonCategory: {
          code: 'PW',
          description: 'Paid work',
          nextDomain: 'ABSENCE_REASON',
        },
        reason: {
          code: 'R11',
          description: 'Paid work - Manufacturing',
        },
        repeat: false,
        startDate: '2025-05-05',
        startTime: '10:00',
        returnDate: '2025-05-05',
        returnTime: '12:00',
        location: { id: 1001, description: 'Random Street, UK' },
        accompanied: true,
        accompaniedBy: { code: 'P', description: 'Police escort' },
        transport: { code: 'POL', description: 'Police vehicle' },
        comments: 'lorem ipsum',
        requireApproval: false,
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)

    // verify page content
    const testPage = await new AddTapCYAPage(page).verifyContent()

    await page.getByText('These details can still be changed after you have saved this absence.').isVisible()

    await testPage.verifyAnswer('Absence type', 'Standard ROTL (Release on Temporary Licence)')
    await testPage.verifyAnswer('Absence sub-type', 'RDR (Resettlement Day Release)')
    await testPage.verifyAnswer('Absence reason', 'Paid work')
    await testPage.verifyAnswer('Work type', 'Manufacturing')

    await testPage.verifyAnswer('Start date', '5 May 2025')
    await testPage.verifyAnswer('Start time', '10:00')
    await testPage.verifyAnswer('End date', '5 May 2025')
    await testPage.verifyAnswer('End time', '12:00')

    await testPage.verifyAnswer(/Location\s+$/, 'Random Street, UK')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Accompanied')
    await testPage.verifyAnswer('Accompanied by', 'Police escort')
    await testPage.verifyAnswer('Transport', 'Police vehicle')

    await testPage.verifyAnswer('Relevant comments', 'lorem ipsum')
    await testPage.verifyAnswer('Approval needed?', 'No')

    await testPage.verifyLink('Change absence type', /absence-type/)
    await testPage.verifyLink('Change absence sub-type', /absence-subtype/)
    await testPage.verifyLink('Change absence reason', /reason-category/)
    await testPage.verifyLink('Change work type', /reason$/)

    await testPage.verifyLink('Change start date', /start-end-dates-and-times#startDate/)
    await testPage.verifyLink('Change start time', /start-end-dates-and-times#startTimeHour/)
    await testPage.verifyLink('Change end date', /start-end-dates-and-times#returnDate/)
    await testPage.verifyLink('Change end time', /start-end-dates-and-times#returnTimeHour/)

    await testPage.verifyLink(/Change location$/, /search-location/)
    await testPage.verifyLink(
      'Change if the prisoner will be accompanied or unaccompanied',
      /accompanied-or-unaccompanied/,
    )
    await testPage.verifyLink('Change who will accompany the prisoner', /accompanied$/)
    await testPage.verifyLink('Change transport type', /transport/)

    await testPage.verifyLink('Change comments', /comments/)
    await testPage.verifyLink('Change approval status', /approval/)

    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Confirm and save')
    expect(page.url()).toMatch(/\/add-temporary-absence\/confirmation/)
  })

  test('should show check answers for minimal mandatory answers', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'PP',
          description: 'Police production',
        },
        repeat: false,
        startDate: '2025-05-05',
        startTime: '10:00',
        returnDate: '2025-05-05',
        returnTime: '12:00',
        location: { id: 1001, description: 'Random Street, UK' },
        accompanied: false,
        transport: { code: 'POL', description: 'Police vehicle' },
        requireApproval: true,
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)

    // verify page content
    const testPage = await new AddTapCYAPage(page).verifyContent()

    await testPage.verifyAnswer('Absence type', 'Police production')
    await expect(page.locator('dt', { hasText: 'Absence sub-type' })).toHaveCount(0)
    await expect(page.locator('dt', { hasText: 'Absence reason' })).toHaveCount(0)

    await testPage.verifyAnswer('Start date', '5 May 2025')
    await testPage.verifyAnswer('Start time', '10:00')
    await testPage.verifyAnswer('End date', '5 May 2025')
    await testPage.verifyAnswer('End time', '12:00')

    await testPage.verifyAnswer(/Location\s+$/, 'Random Street, UK')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await expect(page.locator('dt', { hasText: 'Accompanied by' })).toHaveCount(0)
    await testPage.verifyAnswer('Transport', 'Police vehicle')

    await testPage.verifyAnswer('Relevant comments', 'Not provided')
    await testPage.verifyAnswer('Approval needed?', 'Yes')

    await testPage.verifyLink('Change absence type', /absence-type/)
    await expect(testPage.link('Change absence sub-type')).toHaveCount(0)
    await expect(testPage.link('Change absence reason')).toHaveCount(0)

    await testPage.verifyLink('Change start date', /start-end-dates-and-times#startDate/)
    await testPage.verifyLink('Change start time', /start-end-dates-and-times#startTimeHour/)
    await testPage.verifyLink('Change end date', /start-end-dates-and-times#returnDate/)
    await testPage.verifyLink('Change end time', /start-end-dates-and-times#returnTimeHour/)

    await testPage.verifyLink(/Change location$/, /search-location/)
    await testPage.verifyLink(
      'Change if the prisoner will be accompanied or unaccompanied',
      /accompanied-or-unaccompanied/,
    )
    await expect(testPage.link('Change who will accompany the prisoner')).toHaveCount(0)
    await testPage.verifyLink('Change transport type', /transport/)

    await testPage.verifyLink('Change comments', /comments/)
    await testPage.verifyLink('Change approval status', /approval/)

    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Confirm and save')
    expect(page.url()).toMatch(/\/add-temporary-absence\/confirmation/)

    await verifyAuditEvents([
      {
        what: 'API_CALL_ATTEMPT',
        subjectId: prisonNumber,
        subjectType: 'PRISONER_ID',
        details: `{"apiUrl":"POST /temporary-absence-authorisations/${prisonNumber}","activeCaseLoadId":"LEI"}`,
        service: 'hmpps-external-movements-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
      {
        what: 'API_CALL_SUCCESS',
        subjectId: prisonNumber,
        subjectType: 'PRISONER_ID',
        details: `{"apiUrl":"POST /temporary-absence-authorisations/${prisonNumber}","activeCaseLoadId":"LEI"}`,
        service: 'hmpps-external-movements-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])
  })

  test('should show check answers for repeating TAP', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, {
      addTemporaryAbsence: {
        absenceType: {
          code: 'SR',
          description: 'Standard ROTL (Release on Temporary Licence)',
          nextDomain: 'ABSENCE_SUB_TYPE',
        },
        absenceSubType: {
          code: 'RDR',
          description: 'RDR (Resettlement Day Release)',
          hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
          nextDomain: 'ABSENCE_REASON_CATEGORY',
        },
        reasonCategory: {
          code: 'PW',
          description: 'Paid work',
          nextDomain: 'ABSENCE_REASON',
        },
        reason: {
          code: 'R11',
          description: 'Paid work - Manufacturing',
        },
        repeat: true,
        patternType: 'WEEKLY',
        start: '2025-05-05',
        end: '2025-05-10',
        locations: [{ id: 1001, description: 'Random Street, UK' }],
        occurrences: [
          {
            start: '2025-05-05T10:00',
            end: '2025-05-05T17:00',
            locationIdx: 0,
          },
          {
            start: '2025-05-10T10:00',
            end: '2025-05-10T17:00',
            locationIdx: 0,
          },
        ],
        accompanied: true,
        accompaniedBy: { code: 'P', description: 'Police escort' },
        transport: { code: 'POL', description: 'Police vehicle' },
        comments: 'lorem ipsum',
        requireApproval: false,
      },
    })

    await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)

    // verify page content
    const testPage = await new AddTapCYAPage(page).verifyContent()

    await page
      .getByText(
        'These details can still be changed after you have saved this absence. You can also add additional occurrences to this absence or remove them.',
      )
      .isVisible()

    await testPage.verifyAnswer('Absence type', 'Standard ROTL (Release on Temporary Licence)')
    await testPage.verifyAnswer('Absence sub-type', 'RDR (Resettlement Day Release)')
    await testPage.verifyAnswer('Absence reason', 'Paid work')
    await testPage.verifyAnswer('Work type', 'Manufacturing')

    await testPage.verifyAnswer('Single or repeating absence', 'Repeating')
    await testPage.verifyAnswer('Repeating schedule type', 'Repeat weekly')
    await testPage.verifyAnswer('Start date', '5 May 2025')
    await testPage.verifyAnswer('End date', '10 May 2025')
    await testPage.verifyAnswer('Number of absence occurrences', '2')

    await testPage.verifyAnswer('Locations', 'Random Street, UK')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Accompanied')
    await testPage.verifyAnswer('Accompanied by', 'Police escort')
    await testPage.verifyAnswer('Transport', 'Police vehicle')

    await testPage.verifyAnswer('Relevant comments', 'lorem ipsum')
    await testPage.verifyAnswer('Approval needed?', 'No')

    await testPage.verifyLink('Change absence type', /absence-type/)
    await testPage.verifyLink('Change absence sub-type', /absence-subtype/)
    await testPage.verifyLink('Change absence reason', /reason-category/)
    await testPage.verifyLink('Change work type', /reason$/)

    await testPage.verifyLink('Change repeating schedule type', /repeating-pattern/)
    await testPage.verifyLink('Change start date', /start-end-dates#start/)
    await testPage.verifyLink('Change end date', /start-end-dates#end/)
    await testPage.verifyLink('Change absences', /check-absences/)

    await testPage.verifyLink(/Change locations$/, /search-locations/)
    await testPage.verifyLink(
      'Change if the prisoner will be accompanied or unaccompanied',
      /accompanied-or-unaccompanied/,
    )
    await testPage.verifyLink('Change who will accompany the prisoner', /accompanied$/)
    await testPage.verifyLink('Change transport type', /transport/)

    await testPage.verifyLink('Change comments', /comments/)
    await testPage.verifyLink('Change approval status', /approval/)

    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Confirm and save')
    expect(page.url()).toMatch(/\/add-temporary-absence\/confirmation/)
  })
})
