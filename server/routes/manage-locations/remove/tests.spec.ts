import { expect, test } from '@playwright/test'
import { testNotAuthorisedPage } from '../../../../integration_tests/steps/testNotAuthorisedPage'
import auth from '../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetLocations, stubPutLocations } from '../../../../integration_tests/mockApis/externalMovementsApi'
import { signIn } from '../../../../integration_tests/steps/signIn'
import { RemoveLocationPage } from './test.page'
import { getApiBody } from '../../../../integration_tests/mockApis/wiremock'

test.describe('/manage-locations/remove unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/manage-locations/remove')
  })
})

test.describe('/manage-locations/remove', () => {
  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetLocations('LEI', {
        version: 'version',
        locations: [{ uprn: 9999, description: 'Saved Location, UK' }],
      }),
      stubPutLocations(),
    ])
  })

  test('should remove a saved location', async ({ page }) => {
    await signIn(page)
    await page.goto(`/manage-locations/remove?version=version&idx=0`)

    const testPage = await new RemoveLocationPage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()

    await expect(page.getByText('Saved Location, UK')).toBeVisible()

    // verify validation error
    await testPage.clickButton('Confirm')
    await testPage.link('Select if you want to remove this saved location').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickButton('Confirm')
    expect(page.url()).toMatch(/\/manage-locations/)

    await expect(page.getByText(`Location “Saved Location, UK” removed.`)).toBeVisible()

    expect(await getApiBody('/external-movements-api/prisons/LEI/temporary-absence-locations', 'PUT')).toContainEqual({
      version: 'version',
      locations: [],
    })
  })
})
