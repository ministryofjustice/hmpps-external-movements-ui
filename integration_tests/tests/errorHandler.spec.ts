import { expect, test } from '@playwright/test'
import { resetStubs } from '../mockApis/wiremock'
import auth from '../mockApis/auth'
import componentsApi from '../mockApis/componentsApi'
import { signIn } from '../steps/signIn'

test.describe('test error handlers', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponents()])

    await signIn(page)
  })

  test('should show page not found when 404', async ({ page }) => {
    await page.goto('/non-existing-page')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test.skip('should show user error message on API errors', async ({ page }) => {
    // TODO: add test after implementing a page that needs an API call
    // externalMovementsApi.stubApiError()
    await page.goto('/page-that-needs-api-call')
    await expect(page.getByText('Error message')).toBeVisible()
  })
})
