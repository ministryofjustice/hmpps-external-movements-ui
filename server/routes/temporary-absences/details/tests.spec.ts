import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapOccurrence } from '../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { TapOccurrenceDetailsPage } from './test.page'
import {
  stubGetTapOccurrence,
  stubGetTapOccurrenceHistory,
} from '../../../../integration_tests/mockApis/externalMovementsApi'

test.describe('/temporary-absences/:id', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
    ])
  })

  test('should show temporary absence details for single SCHEDULED absence', async ({ page }) => {
    await signIn(page)
    const occurrenceId = uuidV4()
    await stubGetTapOccurrence({
      ...testTapOccurrence,
      id: occurrenceId,
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
        repeat: false,
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      },
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
      status: { code: 'SCHEDULED', description: 'Scheduled' },
      start: '2001-01-01T10:00:00',
      end: '2001-01-01T17:30:00',
      location: { uprn: 1001, description: 'Random Street, UK' },
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
    })
    await stubGetTapOccurrenceHistory(occurrenceId, {
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
          domainEvents: ['person.temporary-absence.cancelled'],
          occurredAt: '2001-01-01T09:10:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [],
          reason: 'lorem ipsum',
        },
        {
          domainEvents: ['person.temporary-absence.rescheduled'],
          occurredAt: '2001-01-01T09:15:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [
            { propertyName: 'start', previous: '2001-01-01T09:30:00', change: '2001-01-01T10:00:00' },
            { propertyName: 'end', previous: '2001-01-01T17:00:00', change: '2001-01-01T17:30:00' },
          ],
        },
      ],
    })
    await page.goto(`/temporary-absences/${occurrenceId}`)

    // verify page content
    const testPage = await new TapOccurrenceDetailsPage(page).verifyContent()

    await testPage.verifyAnswerNotVisible('Occurrence count')
    await testPage.verifyAnswer('Status', /Scheduled/)
    await testPage.verifyAnswer('Start date and time', 'Monday, 1 January 2001 at 10:00')
    await testPage.verifyAnswer('Return date and time', 'Monday, 1 January 2001 at 17:30')

    await testPage.verifyAnswer('Absence type', 'Restricted ROTL (Release on Temporary Licence)')
    await testPage.verifyAnswer('Absence sub-type', 'RDR (Resettlement Day Release)')
    await testPage.verifyAnswer('Absence reason', 'Paid work')
    await testPage.verifyAnswer('Work type', 'IT and communication')
    await testPage.verifyAnswer('Single or repeating absence', 'Single')

    await testPage.verifyAnswer('Comments', 'Not provided')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswerNotVisible('Accompanied by')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await expect(testPage.link('Change comments (Absence information)')).toBeVisible()

    await expect(testPage.link('Create a new absence for Prisoner-Name Prisoner-Surname')).toBeVisible()
    await expect(testPage.button('Cancel this occurrence')).toBeVisible()
    await expect(testPage.link('View all occurrences of this absence')).toHaveCount(0)
    await expect(testPage.link('Add occurrence')).toHaveCount(0)

    // verify history tab
    await testPage.clickTab('Occurrence history')

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
      'Absence occurrence cancelled',
      ['Temporary absence occurrence cancelled for Prisoner-Name Prisoner-Surname', 'Reason: lorem ipsum'],
      [],
    )
    await testPage.verifyHistoryEntry(
      'Absence occurrence rescheduled',
      [],
      [
        'Start date and time was changed from 1 January 2001 at 09:30 to 1 January 2001 at 10:00',
        'End date and time was changed from 1 January 2001 at 17:00 to 1 January 2001 at 17:30',
      ],
    )
  })

  test('should show temporary absence details for repeating CANCELLED absence', async ({ page }) => {
    await signIn(page)
    const occurrenceId = uuidV4()
    await stubGetTapOccurrence({
      ...testTapOccurrence,
      id: occurrenceId,
      authorisation: {
        ...testTapOccurrence.authorisation,
        repeat: true,
      },
      occurrencePosition: 2,
      totalOccurrences: 8,
      absenceType: {
        code: 'PP',
        description: 'Police production',
      },
      status: { code: 'CANCELLED', description: 'Cancelled' },
      start: '2001-01-01T10:00:00',
      end: '2001-01-01T17:30:00',
      location: { uprn: 1001, description: 'Random Street, UK' },
      accompaniedBy: { code: 'OTH', description: 'Others' },
      transport: { code: 'CAR', description: 'Car' },
      scheduleReference: { type: 'WEEKLY' },
    })
    await stubGetTapOccurrenceHistory(occurrenceId, { content: [] })
    await page.goto(`/temporary-absences/${occurrenceId}`)

    // verify page content
    const testPage = await new TapOccurrenceDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Occurrence count', '2 of 8')
    await testPage.verifyAnswer('Status', /Cancelled/)
    await testPage.verifyAnswer('Start date and time', 'Monday, 1 January 2001 at 10:00')
    await testPage.verifyAnswer('Return date and time', 'Monday, 1 January 2001 at 17:30')
    await testPage.verifyAnswer('Absence type', 'Police production')
    await testPage.verifyAnswerNotVisible('Absence sub-type')
    await testPage.verifyAnswerNotVisible('Absence reason')
    await testPage.verifyAnswerNotVisible('Work type')

    await testPage.verifyAnswer('Single or repeating absence', 'Repeating')
    await testPage.verifyAnswer('Repeating pattern type', 'Repeat weekly')
    await testPage.verifyAnswer('Comments', 'Not provided')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Accompanied')
    await testPage.verifyAnswer('Accompanied by', 'Others')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await expect(testPage.link('Change comments (Absence information)')).toHaveCount(0)

    await expect(testPage.link('Create a new absence for Prisoner-Name Prisoner-Surname')).toBeVisible()
    await expect(testPage.button('Cancel this occurrence')).toHaveCount(0)
    await expect(testPage.link('View all occurrences of this absence')).toBeVisible()
    await expect(testPage.link('Add occurrence')).toBeVisible()
  })

  test('should not show cancel button for view only user', async ({ page }) => {
    await signIn(page, { roles: ['EXTERNAL_MOVEMENTS_TAP_RO'] })
    const occurrenceId = uuidV4()
    await stubGetTapOccurrence({ ...testTapOccurrence, id: occurrenceId })
    await stubGetTapOccurrenceHistory(occurrenceId, { content: [] })
    await page.goto(`/temporary-absences/${occurrenceId}`)

    // verify page content
    const testPage = await new TapOccurrenceDetailsPage(page).verifyContent()

    await expect(testPage.link('Change comments (Absence information)')).toHaveCount(0)
    await expect(testPage.link('Create a new absence for Prisoner-Name Prisoner-Surname')).toHaveCount(0)
    await expect(testPage.button('Cancel this occurrence')).toHaveCount(0)
    await expect(testPage.link('Add occurrence')).toHaveCount(0)
  })
})
