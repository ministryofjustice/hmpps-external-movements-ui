import { expect, Page, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import { randomPrisonNumber } from '../../../../../../integration_tests/data/testData'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { EditAbsenceCommentsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absences/edit/comments', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absences/edit/comments`)
  })
})

test.describe('/temporary-absences/edit/comments', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()
  const occurrenceId = uuidV4()

  const authorisation = {
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: {
      code: 'PENDING',
      description: 'To be reviewed',
    },
    absenceType: {
      code: 'SR',
      description: 'Standard ROTL (Release on Temporary Licence)',
    },
    absenceSubType: {
      code: 'RDR',
      description: 'RDR (Resettlement Day Release)',
      hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
    },
    absenceReason: {
      code: 'R3',
      description: 'Maintaining family ties',
    },
    accompaniedBy: {
      code: 'U',
      description: 'Unaccompanied',
    },
    transport: {
      code: 'VAN',
      description: 'Van',
    },
    repeat: false,
    fromDate: '2026-01-01',
    toDate: '2026-01-31',
    occurrences: [
      {
        id: occurrenceId,
        status: {
          code: 'PENDING',
          description: 'To be reviewed',
        },
        absenceType: {
          code: 'SR',
          description: 'Standard ROTL (Release on Temporary Licence)',
        },
        absenceSubType: {
          code: 'RDR',
          description: 'RDR (Resettlement Day Release)',
          hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
        },
        absenceReason: {
          code: 'R3',
          description: 'Maintaining family ties',
        },
        releaseAt: '2026-01-01T09:00:00',
        returnBy: '2026-01-31T10:01:00',
        location: {
          description: 'SE1 7AB',
        },
        accompaniedBy: {
          code: 'U',
          description: 'Unaccompanied',
        },
        transport: {
          code: 'VAN',
          description: 'Van',
        },
        notes: 'Staying with cousin John Smith',
      },
    ],
    locations: [{ uprn: 1001, description: 'Random Street, UK' }],
    notes: 'Staying with cousin John Smith ',
  }

  const occurrence = {
    id: occurrenceId,
    authorisation,
    absenceType: {
      code: 'SR',
      description: 'Standard ROTL (Release on Temporary Licence)',
    },
    absenceSubType: {
      code: 'RDR',
      description: 'RDR (Resettlement Day Release)',
      hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
    },
    absenceReason: {
      code: 'R3',
      description: 'Maintaining family ties',
    },
    status: {
      code: 'PENDING',
      description: 'To be reviewed',
    },
    releaseAt: '2026-01-01T09:00:00',
    returnBy: '2026-01-31T10:01:00',
    location: { uprn: 1001, description: 'Random Street, UK' },
    accompaniedBy: {
      code: 'U',
      description: 'Unaccompanied',
    },
    transport: {
      code: 'VAN',
      description: 'Van',
    },
    notes: 'Staying with cousin John Smith',
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubGetTapOccurrence(occurrence),
      stubPutTapOccurrence(occurrenceId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.temporary-absence.notes-changed'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/comments`)
  }

  test('should load page with notes pre-propulated', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditAbsenceCommentsPage(page).verifyContent()

    await expect(testPage.notesField()).toBeVisible()
    await expect(testPage.notesField()).toHaveValue('Staying with cousin John Smith')
    await expect(testPage.button('Continue')).toBeVisible()
  })

  test('should go to confirmation page when notes are updated', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditAbsenceCommentsPage(page).verifyContent()

    await expect(testPage.notesField()).toBeVisible()
    await expect(testPage.notesField()).toHaveValue('Staying with cousin John Smith')
    await expect(testPage.button('Continue')).toBeVisible()

    await testPage.notesField().clear()
    await testPage.notesField().fill(`Test text`)
    await testPage.clickButton('Continue')
    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)
  })

  test('should allow empty notes', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditAbsenceCommentsPage(page).verifyContent()

    await expect(testPage.notesField()).toBeVisible()
    await expect(testPage.notesField()).toHaveValue('Staying with cousin John Smith')
    await expect(testPage.button('Continue')).toBeVisible()

    await testPage.notesField().clear()
    await testPage.clickButton('Continue')
    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)
  })

  test('should not allow more than 4000 characters', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditAbsenceCommentsPage(page).verifyContent()

    await expect(testPage.notesField()).toBeVisible()
    await expect(testPage.notesField()).toHaveValue('Staying with cousin John Smith')
    await expect(testPage.button('Continue')).toBeVisible()

    const testString = 'a'.repeat(4001)
    await testPage.notesField().clear()
    await testPage.notesField().fill(testString)
    await testPage.clickButton('Continue')

    await expect(testPage.errorSummary()).toBeVisible()
    await expect(testPage.errorSummaryTitle()).toContainText('There is a problem')
    await expect(testPage.errorSummaryList()).toContainText('The maximum character limit is 4000')
  })
})
