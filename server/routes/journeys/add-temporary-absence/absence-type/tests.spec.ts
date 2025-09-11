import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import { resetStubs } from '../../../../../integration_tests/mockApis/wiremock'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'

class AbsenceTypePage extends BaseTestPage {
  async verifyContent(prisonNumber: string) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/absence-type/,
      title: 'Select absence type - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'What type of absence is this?',
      backUrl: new RegExp(`/prisoner/${prisonNumber}`),
    })
  }

  rotlRadio() {
    return this.radio('Standard ROTL (Release on Temporary Licence)')
  }

  securityEscortRadio() {
    return this.radio('Security escort')
  }

  ppRadio() {
    return this.radio('Police production')
  }
}

test.describe('/add-temporary-absence/absence-type', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
    ])

    await signIn(page)
  })

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()

    // start journey
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)

    // verify page content
    const testPage = await new AbsenceTypePage(page).verifyContent(prisonNumber)

    await expect(testPage.rotlRadio()).toBeVisible()
    await expect(testPage.rotlRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select the absence type').click()
    await expect(testPage.rotlRadio()).toBeFocused()

    // verify next page routing
    await testPage.rotlRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/absence-subtype/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.rotlRadio()).toBeChecked()
  })

  test('should try alternative routing to reason', async ({ page }) => {
    const journeyId = uuidV4()

    // start journey
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)

    // verify page content
    const testPage = await new AbsenceTypePage(page).verifyContent(prisonNumber)

    // verify next page routing
    await testPage.securityEscortRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/reason/)
  })

  test('should try alternative routing to single-or-repeating', async ({ page }) => {
    const journeyId = uuidV4()

    // start journey
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)

    // verify page content
    expect(page.url()).toMatch(/\/add-temporary-absence\/absence-type/)
    const testPage = await new AbsenceTypePage(page).verifyContent(prisonNumber)

    // verify next page routing
    await testPage.ppRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/add-temporary-absence\/single-or-repeating/)
  })
})
