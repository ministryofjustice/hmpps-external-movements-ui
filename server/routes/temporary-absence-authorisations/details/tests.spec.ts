import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../integration_tests/data/testData'
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
      id: authorisationId,
      person: {
        personIdentifier: 'A9965EA',
        firstName: 'PRISONER-NAME',
        lastName: 'PRISONER-SURNAME',
        dateOfBirth: '1990-01-01',
        cellLocation: '2-1-005',
      },
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
      fromDate: '2001-01-01',
      toDate: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          releaseAt: '2001-01-01T10:00:00',
          returnBy: '2001-01-01T17:30:00',
          location: { uprn: 1001, description: 'Random Street, UK' },
          accompaniedBy: { code: 'U', description: 'Unaccompanied' },
          transport: { code: 'CAR', description: 'Car' },
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Status', /To be reviewed/)
    await testPage.verifyAnswer('Absence type', 'Restricted ROTL (Release on Temporary Licence)')
    await testPage.verifyAnswer('Absence sub-type', 'RDR (Resettlement Day Release)')
    await testPage.verifyAnswer('Absence reason', 'Paid work')
    await testPage.verifyAnswer('Work type', 'IT and communication')

    await testPage.verifyAnswer('Start date', '1 January 2001')
    await testPage.verifyAnswer('End date', '1 January 2001')
    await testPage.verifyAnswer('Single or repeating absence', 'Single')
    await testPage.verifyAnswer('Comments', 'Not provided')

    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await testPage.verifyTableRow(1, ['Monday, 1 January at 10:00', 'Monday, 1 January at 17:30', /To be reviewed/])

    await expect(testPage.button('Review this absence')).toBeVisible()
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)
  })

  test('should show temporary absence details for APPROVED absence', async ({ page }) => {
    await signIn(page)

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      id: authorisationId,
      person: {
        personIdentifier: 'A9965EA',
        firstName: 'PRISONER-NAME',
        lastName: 'PRISONER-SURNAME',
        dateOfBirth: '1990-01-01',
        cellLocation: '2-1-005',
      },
      status: { code: 'APPROVED', description: 'Approved' },
      absenceType: { code: 'PP', description: 'Police production' },
      repeat: false,
      fromDate: '2001-01-01',
      toDate: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          releaseAt: '2001-01-01T10:00:00',
          returnBy: '2001-01-01T17:30:00',
          location: { uprn: 1001, description: 'Random Street, UK' },
          accompaniedBy: { code: 'U', description: 'Unaccompanied' },
          transport: { code: 'CAR', description: 'Car' },
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Status', /Approved/)
    await testPage.verifyAnswer('Absence type', 'Police production')
    await testPage.verifyAnswerNotVisible('Absence sub-type')
    await testPage.verifyAnswerNotVisible('Absence reason')
    await testPage.verifyAnswerNotVisible('Work type')

    await testPage.verifyAnswer('Start date', '1 January 2001')
    await testPage.verifyAnswer('End date', '1 January 2001')
    await testPage.verifyAnswer('Single or repeating absence', 'Single')
    await testPage.verifyAnswer('Comments', 'Not provided')

    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswer('Transport', 'Car')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await testPage.verifyTableRow(1, ['Monday, 1 January at 10:00', 'Monday, 1 January at 17:30', /To be reviewed/])

    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toBeVisible()
  })

  test('should not show cancel button for view only user', async ({ page }) => {
    await signIn(page, { roles: ['EXTERNAL_MOVEMENTS__TAP__RO'] })

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      id: authorisationId,
      person: {
        personIdentifier: 'A9965EA',
        firstName: 'PRISONER-NAME',
        lastName: 'PRISONER-SURNAME',
        dateOfBirth: '1990-01-01',
        cellLocation: '2-1-005',
      },
      status: { code: 'APPROVED', description: 'Approved' },
      absenceType: { code: 'PP', description: 'Police production' },
      repeat: false,
      fromDate: '2001-01-01',
      toDate: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          releaseAt: '2001-01-01T10:00:00',
          returnBy: '2001-01-01T17:30:00',
          location: { uprn: 1001, description: 'Random Street, UK' },
          accompaniedBy: { code: 'U', description: 'Unaccompanied' },
          transport: { code: 'CAR', description: 'Car' },
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)
  })

  test('should not show review button for view only user', async ({ page }) => {
    await signIn(page, { roles: ['EXTERNAL_MOVEMENTS__TAP__RO'] })

    const authorisationId = uuidV4()
    await stubGetTapAuthorisation({
      id: authorisationId,
      person: {
        personIdentifier: 'A9965EA',
        firstName: 'PRISONER-NAME',
        lastName: 'PRISONER-SURNAME',
        dateOfBirth: '1990-01-01',
        cellLocation: '2-1-005',
      },
      status: { code: 'PENDING', description: 'To be reviewed' },
      absenceType: { code: 'PP', description: 'Police production' },
      repeat: false,
      fromDate: '2001-01-01',
      toDate: '2001-01-01',
      accompaniedBy: { code: 'U', description: 'Unaccompanied' },
      transport: { code: 'CAR', description: 'Car' },
      locations: [{ uprn: 1001, description: 'Random Street, UK' }],
      occurrences: [
        {
          id: 'occurrence-id',
          status: { code: 'PENDING', description: 'To be reviewed' },
          releaseAt: '2001-01-01T10:00:00',
          returnBy: '2001-01-01T17:30:00',
          location: { uprn: 1001, description: 'Random Street, UK' },
          accompaniedBy: { code: 'U', description: 'Unaccompanied' },
          transport: { code: 'CAR', description: 'Car' },
        },
      ],
    })
    await stubGetTapAuthorisationHistory(authorisationId, { content: [] })

    await page.goto(`/temporary-absence-authorisations/${authorisationId}`)

    // verify page content
    const testPage = await new TapAuthorisationDetailsPage(page).verifyContent()

    await expect(testPage.button('Review this absence')).toHaveCount(0)
    await expect(testPage.button('Cancel this absence')).toHaveCount(0)
  })
})
