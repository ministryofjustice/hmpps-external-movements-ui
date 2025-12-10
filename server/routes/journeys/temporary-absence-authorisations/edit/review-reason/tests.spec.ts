import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber, testTapAuthorisation } from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubPutTapAuthorisation,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { TapAuthorisationReviewReasonPage } from './test.page'
import { ReviewTapAuthorisationPage } from '../review/test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absence-authorisations/edit/review-reason unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absence-authorisations/edit/review-reason`)
  })
})

test.describe('/temporary-absence-authorisations/edit/review-reason', () => {
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
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubPutTapAuthorisation(authorisationId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.temporary-absence-authorisation.approved'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string, approve: boolean) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-edit/${authorisationId}/review`)

    const reviewPage = await new ReviewTapAuthorisationPage(page)
    if (approve) {
      await reviewPage.yesRadio().click()
    } else {
      await reviewPage.noRadio().click()
    }
    await reviewPage.clickContinue()
  }

  test('should try approve reason path', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, true)

    // verify page content
    const testPage = await new TapAuthorisationReviewReasonPage(page).verifyContent()

    await expect(page.getByText('Enter a reason for approving this absence (optional)')).toBeVisible()
    await expect(testPage.reasonField()).toBeVisible()
    await expect(testPage.reasonField()).toHaveValue('')
    await expect(testPage.button('Confirm and approve')).toBeVisible()

    // verify next page routing
    await testPage.reasonField().fill(`test`)
    await testPage.clickButton('Confirm and approve')

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)
  })

  test('should try reject reason path', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, false)

    // verify page content
    const testPage = await new TapAuthorisationReviewReasonPage(page).verifyContent()

    await expect(page.getByText('Enter a reason for rejecting this absence (optional)')).toBeVisible()
    await expect(testPage.reasonField()).toBeVisible()
    await expect(testPage.reasonField()).toHaveValue('')
    await expect(testPage.button('Confirm and reject')).toBeVisible()

    // verify next page routing
    await testPage.reasonField().fill(`test`)
    await testPage.clickButton('Confirm and reject')

    expect(page.url()).toMatch(/\/temporary-absence-authorisations\/edit\/confirmation/)
  })
})
