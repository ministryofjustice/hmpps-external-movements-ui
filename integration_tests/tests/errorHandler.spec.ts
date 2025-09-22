import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../mockApis/auth'
import componentsApi from '../mockApis/componentsApi'
import { signIn } from '../steps/signIn'
import { stubGetAllAbsenceTypesError } from '../mockApis/externalMovementsApi'
import { randomPrisonNumber } from '../data/testData'
import { stubGetPrisonerDetails } from '../mockApis/prisonerSearchApi'

test.describe('test error handlers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignIn(), componentsApi.stubComponents()])
    await signIn(page)
  })

  test('should show page not found when 404', async ({ page }) => {
    await page.goto('/non-existing-page')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('should show user error message on API errors', async ({ page }) => {
    const prisonNumber = randomPrisonNumber()
    await stubGetPrisonerDetails({ prisonerNumber: prisonNumber })
    await stubGetAllAbsenceTypesError()

    await page.goto(`/${uuidV4()}/add-temporary-absence/start/${prisonNumber}`)
    await expect(page.getByRole('link', { name: 'Stubbed API error returned' })).toBeVisible()
  })
})
