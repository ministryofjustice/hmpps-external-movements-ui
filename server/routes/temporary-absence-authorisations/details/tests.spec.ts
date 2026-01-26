import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { TapAuthorisationDetailsPage } from './test.page'
import {
  stubGetTapAuthorisation,
  stubGetTapAuthorisationHistory,
} from '../../../../integration_tests/mockApis/externalMovementsApi'

test.describe('/temporary-absence-authorisations/:id', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
    ])
  })

  test('should show temporary absence details for PENDING absence', async ({ page }) => {
    await signIn(page)

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      ...testTapAuthorisation,
      id: authorisationId,
      status: { code: 'PENDING', description: 'To be reviewed' },
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
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          start: '2001-01-01T10:00:00',
          end: '2001-01-01T17:30:00',
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, {
      content: [
        {
          domainEvents: ['person.temporary-absence-authorisation.pending'],
          occurredAt: '2001-01-01T09:00:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [],
        },
        {
          domainEvents: ['person.temporary-absence-authorisation.approved'],
          occurredAt: '2001-01-01T09:05:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [],
        },
        {
          domainEvents: ['person.temporary-absence-authorisation.cancelled'],
          occurredAt: '2001-01-01T09:10:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [],
          reason: 'lorem ipsum',
        },
        {
          domainEvents: ['person.temporary-absence-authorisation.date-range-changed'],
          occurredAt: '2001-01-01T09:15:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [{ propertyName: 'start', previous: '2001-01-02', change: '2001-01-01' }],
        },
        {
          domainEvents: ['person.temporary-absence-authorisation.migrated'],
          occurredAt: '2001-01-01T09:20:00',
          user: { name: 'Migrate User', username: 'MIGRATE' },
          changes: [{ propertyName: 'start', previous: '2001-01-02', change: '2001-01-01' }],
        },
      ],
    })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await testPage.verifyAnswerNotVisible('Number of occurrences')
    await testPage.verifyAnswer('Status', /To be reviewed/)
    await testPage.verifyAnswer('Absence type', 'Restricted ROTL (Release on Temporary Licence)')
    await testPage.verifyAnswer('Absence sub-type', 'RDR (Resettlement Day Release)')
    await testPage.verifyAnswer('Absence reason', 'Paid work')
    await testPage.verifyAnswer('Work type', 'IT and communication')

    await testPage.verifyAnswerNotVisible('Start date')
    await testPage.verifyAnswerNotVisible('End date')
    await testPage.verifyAnswer('Single or repeating absence', 'Single')
    await testPage.verifyAnswerNotVisible('Repeating pattern type')
    await testPage.verifyAnswer('Comments', 'Not provided')

    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await testPage.verifyTableRow(1, ['Monday 1 January at 10:00', 'Monday 1 January at 17:30', /To be reviewed/])

    await expect(testPage.link('Change comments (Absence information)')).toBeVisible()

    await expect(testPage.button('Review this absence')).toBeVisible()
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)

    // verify short-cut change link for occurrence's location
    await expect(testPage.link('Change location')).toBeVisible()
    await expect(testPage.link('Change location')).toHaveAttribute(
      'href',
      /\/temporary-absences\/start-edit\/occurrence-id\/location/,
    )

    // verify history tab
    await testPage.clickTab('Absence history')

    await testPage.verifyHistoryEntry(
      'Absence created',
      ['Temporary absence created for Prisoner-Name Prisoner-Surname'],
      [],
    )
    await testPage.verifyHistoryEntry(
      'Absence approved',
      ['Temporary absence approved for Prisoner-Name Prisoner-Surname', 'User Name did not enter a reason.'],
      [],
    )
    await testPage.verifyHistoryEntry(
      'Absence cancelled',
      ['Temporary absence cancelled for Prisoner-Name Prisoner-Surname', 'Reason: lorem ipsum'],
      [],
    )
    await testPage.verifyHistoryEntry(
      'Absence date range changed',
      [],
      ['Start date was changed from 2 January 2001 to 1 January 2001'],
    )
    await testPage.verifyHistoryEntry('Absence migrated', ['Temporary absence migrated from NOMIS'], [])
    await expect(page.getByText('by User Name (USERNAME)')).toHaveCount(4)
    await expect(page.getByText('by Migrate User (MIGRATE)')).toHaveCount(0)
  })

  test('should show temporary absence details for APPROVED absence', async ({ page }) => {
    await signIn(page)

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      ...testTapAuthorisation,
      id: authorisationId,
      status: { code: 'APPROVED', description: 'Approved' },
      absenceType: { code: 'PP', description: 'Police production' },
      repeat: false,
      start: '2001-01-01',
      end: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          start: '2001-01-01T10:00:00',
          end: '2001-01-01T17:30:00',
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await testPage.verifyAnswerNotVisible('Number of occurrences')
    await testPage.verifyAnswer('Status', /Approved/)
    await testPage.verifyAnswer('Absence type', 'Police production')
    await testPage.verifyAnswerNotVisible('Absence sub-type')
    await testPage.verifyAnswerNotVisible('Absence reason')
    await testPage.verifyAnswerNotVisible('Work type')

    await testPage.verifyAnswerNotVisible('Start date')
    await testPage.verifyAnswerNotVisible('End date')
    await testPage.verifyAnswer('Single or repeating absence', 'Single')
    await testPage.verifyAnswerNotVisible('Repeating pattern type')
    await testPage.verifyAnswer('Comments', 'Not provided')

    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await testPage.verifyTableRow(1, ['Monday 1 January at 10:00', 'Monday 1 January at 17:30', /To be reviewed/])

    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toBeVisible()
  })

  test('should show temporary absence details for DENIED absence', async ({ page }) => {
    await signIn(page)

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      ...testTapAuthorisation,
      id: authorisationId,
      status: { code: 'DENIED', description: 'Denied' },
      absenceType: { code: 'PP', description: 'Police production' },
      repeat: false,
      start: '2001-01-01',
      end: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          start: '2001-01-01T10:00:00',
          end: '2001-01-01T17:30:00',
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await expect(testPage.link('Change comments (Absence information)')).toHaveCount(0)
    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)
  })

  test('should handle edge case for legacy records', async ({ page }) => {
    await signIn(page)

    const authorisationId = uuidV4()

    const { absenceType, ...authorisation } = testTapAuthorisation

    await stubGetTapAuthorisation({
      ...authorisation,
      id: authorisationId,
      status: { code: 'APPROVED', description: 'Approved' },
      absenceReason: { code: 'PP', description: 'Police production' },
      repeat: false,
      start: '2001-01-01',
      end: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          start: '2001-01-01T10:00:00',
          end: '2001-01-01T17:30:00',
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Absence type', 'Not provided')
    await testPage.verifyAnswer('Absence reason', 'Police production')

    await testPage.verifyLink(
      'Change absence type',
      /temporary-absence-authorisations\/start-edit\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/absence-type/,
    )
    await expect(testPage.link('Change absence reason')).toHaveCount(0)
  })

  test('should show temporary absence details for repeating absence', async ({ page }) => {
    await signIn(page)

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      ...testTapAuthorisation,
      id: authorisationId,
      status: { code: 'PENDING', description: 'To be reviewed' },
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
      repeat: true,
      schedule: { type: 'WEEKLY' },
      totalOccurrenceCount: 12,
      start: '2001-01-01',
      end: '2001-01-21',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          start: '2001-01-01T10:00:00',
          end: '2001-01-01T17:30:00',
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Number of occurrences', '12')
    await testPage.verifyAnswer('Status', /To be reviewed/)
    await testPage.verifyAnswer('Absence type', 'Restricted ROTL (Release on Temporary Licence)')
    await testPage.verifyAnswer('Absence sub-type', 'RDR (Resettlement Day Release)')
    await testPage.verifyAnswer('Absence reason', 'Paid work')
    await testPage.verifyAnswer('Work type', 'IT and communication')

    await testPage.verifyAnswer('Start date', '1 January 2001')
    await testPage.verifyAnswer('End date', '21 January 2001')
    await testPage.verifyAnswer('Single or repeating absence', 'Repeating')
    await testPage.verifyAnswer('Repeating pattern type', 'Repeat weekly')
    await testPage.verifyAnswer('Comments', 'Not provided')

    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await testPage.verifyTableRow(1, ['Monday 1 January at 10:00', 'Monday 1 January at 17:30', /To be reviewed/])

    await expect(testPage.button('Review this absence')).toBeVisible()
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)

    await expect(testPage.link('Change location')).toHaveCount(0)
  })

  test('should not show cancel button for view only user', async ({ page }) => {
    await signIn(page, { roles: ['EXTERNAL_MOVEMENTS_TAP_RO'] })

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      ...testTapAuthorisation,
      id: authorisationId,
      person: {
        personIdentifier: 'A9965EA',
        firstName: 'PRISONER-NAME',
        lastName: 'PRISONER-SURNAME',
        dateOfBirth: '1990-01-01',
        cellLocation: '2-1-005',
      },
      status: { code: 'APPROVED', description: 'Approved' },
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)
  })

  test('should not show review button for view only user', async ({ page }) => {
    await signIn(page, { roles: ['EXTERNAL_MOVEMENTS_TAP_RO'] })

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      ...testTapAuthorisation,
      id: authorisationId,
      status: { code: 'PENDING', description: 'To be reviewed' },
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)
  })
})
