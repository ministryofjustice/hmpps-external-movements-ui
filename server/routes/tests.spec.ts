import { test, expect } from '@playwright/test'
import auth from '../../integration_tests/mockApis/auth'
import componentsApi from '../../integration_tests/mockApis/componentsApi'
import { stubGetOverview } from '../../integration_tests/mockApis/externalMovementsApi'
import { signIn } from '../../integration_tests/steps/signIn'
import { TapHomePage } from './test.page'

test.describe('/temporary-absences-home', () => {
  test.beforeAll(async () => {
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponents(), stubGetOverview('LEI')])
  })

  test('should show temporary absence homepage (read-write role)', async ({ page }) => {
    await signIn(page)
    await page.goto(`/temporary-absences-home`)

    const testPage = await new TapHomePage(page).verifyContent()

    await expect(testPage.link('Add a temporary absence')).toHaveAttribute('href', /search-prisoner\?/)
    await expect(testPage.link('View and manage absence plans')).toHaveAttribute(
      'href',
      /temporary-absence-authorisations\?/,
    )
    await expect(testPage.link('View and manage absence occurrences')).toHaveAttribute('href', /temporary-absences\?/)
    await expect(testPage.link('Create and download documents')).toHaveAttribute(
      'href',
      /search-prisoner\/tap-documents\?/,
    )

    await expect(testPage.link('View temporary absences with status ‘Awaiting decision’')).toHaveAttribute(
      'href',
      /temporary-absence-authorisations\?status=PENDING/,
    )

    await expect(testPage.link('View a prisoner’s temporary absences')).toHaveAttribute(
      'href',
      /\/search-prisoner\/temporary-absence-schedule-enquiry/,
    )
  })

  test('should show temporary absence homepage (read-only role)', async ({ page }) => {
    await signIn(page, { roles: ['EXTERNAL_MOVEMENTS_TAP_RO'] })
    await page.goto(`/temporary-absences-home`)

    const testPage = await new TapHomePage(page).verifyContent()

    await expect(testPage.link('Add a temporary absence')).toHaveCount(0)
    await expect(testPage.link('View absence plans')).toHaveAttribute('href', /temporary-absence-authorisations\?/)
    await expect(testPage.link('View absence occurrences')).toHaveAttribute('href', /temporary-absences\?/)
    await expect(testPage.link('Create and download documents')).toHaveAttribute(
      'href',
      /search-prisoner\/tap-documents\?/,
    )

    await expect(testPage.link('View temporary absences with status ‘Awaiting decision’')).toHaveCount(0)

    await expect(testPage.link('View a prisoner’s temporary absences')).toHaveAttribute(
      'href',
      /\/search-prisoner\/temporary-absence-schedule-enquiry/,
    )
  })
})
