import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapAuthorisationCommentsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/edit/comments unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/comments`)
  })
})

test.describe('/temporary-absence-authorisations/edit/comments', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    repeat: false,
    comments: 'existing comments',
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/comments`)
  }

  test('should confirm and save comments', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapAuthorisationCommentsPage(page).verifyContent()

    await expect(testPage.commentsField()).toBeVisible()
    await expect(testPage.commentsField()).toHaveValue('existing comments')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(4001))
    await testPage.clickContinue()
    await testPage.clickLink('The maximum character limit is 4000')
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    await testPage.commentsField().fill('new comments')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/change-confirmation/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.commentsField()).toHaveValue('new comments')
  })
})
