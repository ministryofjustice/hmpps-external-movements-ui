import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../integration_tests/steps/signIn'
import { testTapMovement } from '../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { TapMovementDetailsPage } from './test.page'
import {
  stubGetTapMovement,
  stubGetTapMovementHistory,
} from '../../../../integration_tests/mockApis/externalMovementsApi'
import { NotAuthorisedPage } from '../../../../integration_tests/pages/NotAuthorisedPage'

test.describe('/temporary-absence-movements/:id', () => {
  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: testTapMovement.person.personIdentifier }),
    ])
  })

  test('should show 403 error if TAP movement is outside the user caseloads', async ({ page }) => {
    await signIn(page)

    const movementId = uuidV4()
    await stubGetTapMovement({
      ...testTapMovement,
      id: movementId,
      prisonCode: 'OUT',
    })
    await stubGetTapMovementHistory(movementId, { content: [] })
    await page.goto(`/temporary-absence-movements/${movementId}`)
    await new NotAuthorisedPage(page).verifyContent()
  })

  test('should show temporary absence movement details', async ({ page }) => {
    await signIn(page)
    const movementId = uuidV4()
    await stubGetTapMovement({
      ...testTapMovement,
      id: movementId,
    })
    await stubGetTapMovementHistory(movementId, {
      content: [
        {
          domainEvents: ['person.external-movement.migrated'],
          occurredAt: '2001-01-01T10:00:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [],
        },
      ],
    })
    await page.goto(`/temporary-absence-movements/${movementId}`)

    // verify page content
    const testPage = await new TapMovementDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Direction', 'OUT')
    await testPage.verifyAnswer('Date and time', '1 January 2001 at 10:00')
    await testPage.verifyAnswer('Absence reason', 'Police production')
    await testPage.verifyAnswer('Comments', 'Not provided')
    await testPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await testPage.verifyAnswer('Location', 'Random Street, UK')

    await expect(testPage.link('View absence occurrence information')).toHaveAttribute(
      'href',
      /\/temporary-absences\/occurrence-id/,
    )

    // verify history tab
    await testPage.clickTab('Movement history')

    await testPage.verifyHistoryEntry(
      'Absence movement migrated',
      ['Temporary absence movement migrated from NOMIS'],
      [],
    )
  })
})
