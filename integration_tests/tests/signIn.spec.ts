import { expect, test } from '@playwright/test'
import auth from '../mockApis/auth'
import componentsApi from '../mockApis/componentsApi'
import { signIn } from '../steps/signIn'
import tokenVerification from '../mockApis/tokenVerification'

test.describe('Sign In', () => {
  test.beforeEach(async () => {
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponentsFail()])
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('User name visible in header', async ({ page }) => {
    await signIn(page)
    await expect(page.getByTestId('header-user-name')).toContainText('J. Smith')
  })

  test('User can sign out', async ({ page }) => {
    await signIn(page)
    await page.getByTestId('signOut').click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('heading', { name: 'Sign in' })).not.toBeAttached()

    await tokenVerification.stubVerifyToken(false)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('Token verification failure clears user session', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('heading', { name: 'Sign in' })).not.toBeAttached()

    await tokenVerification.stubVerifyToken(false)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await tokenVerification.stubVerifyToken(true)
    await auth.stubSignIn({ name: 'bobby brown' })
    await signIn(page)

    await expect(page.getByTestId('header-user-name')).toContainText('B. Brown')
  })
})
