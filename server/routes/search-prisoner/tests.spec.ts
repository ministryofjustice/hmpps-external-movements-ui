import { test, expect } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import { stubSearchPrisoner } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../integration_tests/mockApis/prisonApi'
import { testNotAuthorisedPage } from '../../../integration_tests/steps/testNotAuthorisedPage'
import { SearchPrisonerPage } from './test.page'

test.describe('/search-prisoner unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/search-prisoner')
  })
})

test.describe('/search-prisoner', () => {
  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubSearchPrisoner('LEI', '.+', {
        content: [
          {
            prisonerNumber: 'A1234EA',
            firstName: 'Name',
            lastName: 'One',
            cellLocation: 'Loc-1',
            prisonId: 'LEI',
            dateOfBirth: '',
            status: '',
            prisonName: '',
          },
          {
            prisonerNumber: 'A2345EA',
            firstName: 'Another',
            lastName: 'Two',
            cellLocation: 'Loc-2',
            prisonId: 'LEI',
            dateOfBirth: '',
            status: '',
            prisonName: '',
          },
        ],
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should try all cases', async ({ page }) => {
    await page.goto('/search-prisoner')

    // verify page content
    const testPage = await new SearchPrisonerPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('')
    await expect(testPage.button('Search')).toBeVisible()

    // verify validation error
    await testPage.clickButton('Search')
    await testPage.link('Enter a name or prison number').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify successful search
    await testPage.searchField().fill('test')
    await testPage.clickButton('Search')

    await testPage.verifyTableRow(1, ['Name One', 'A1234EA', 'Loc-1'])
    await expect(testPage.link('Add temporary absence for Name One')).toHaveAttribute(
      'href',
      /\/add-temporary-absence\/start\/A1234EA/,
    )

    await testPage.verifyTableRow(2, ['Another Two', 'A2345EA', 'Loc-2'])
    await expect(testPage.link('Add temporary absence for Another Two')).toHaveAttribute(
      'href',
      /\/add-temporary-absence\/start\/A2345EA/,
    )
  })
})
