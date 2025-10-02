import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'

class AbsenceCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/comments/,
      title: 'Enter optional comments - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter any relevant comments (optional)',
      backUrl: /transport/,
    })
  }

  commentsInput() {
    return this.textbox('Enter any relevant comments (optional)')
  }
}

test.describe('/add-temporary-absence/comments', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await page.goto(`/${journeyId}/add-temporary-absence/comments`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AbsenceCommentsPage(page).verifyContent()

    await expect(testPage.commentsInput()).toBeVisible()
    await expect(testPage.commentsInput()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.commentsInput().fill('n'.repeat(4001))
    await testPage.clickContinue()
    await testPage.link('The maximum character limit is 4000').click()
    await expect(testPage.commentsInput()).toBeFocused()

    // verify next page routing
    await testPage.commentsInput().fill('Sample text')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/approval/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.commentsInput()).toHaveValue('Sample text')

    // verify empty input can overwrite comments
    await testPage.commentsInput().fill(' ')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/approval/)

    await page.goBack()
    await page.reload()
    await expect(testPage.commentsInput()).toHaveValue('')
  })
})
