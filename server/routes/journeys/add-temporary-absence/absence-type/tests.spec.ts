import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetAllAbsenceTypes } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { AbsenceTypePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { verifyAuditEvents } from '../../../../../integration_tests/steps/verifyAuditEvents'

test.describe('/add-temporary-absence/absence-type unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/add-temporary-absence/absence-type`)
  })
})

test.describe('/add-temporary-absence/absence-type', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
    ])
  })

  test.beforeEach(async ({ page }) => {
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

    // verify audit events
    await verifyAuditEvents([
      {
        what: 'PAGE_VIEW',
        subjectType: 'PRISONER_ID',
        subjectId: prisonNumber,
        details: `{"pageUrl":"/${journeyId}/add-temporary-absence/absence-type","pageName":"ADD_TEMPORARY_ABSENCE","activeCaseLoadId":"LEI"}`,
        service: 'hmpps-external-movements-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
      {
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        subjectType: 'PRISONER_ID',
        subjectId: prisonNumber,
        details: `{"pageUrl":"/${journeyId}/add-temporary-absence/absence-type","pageName":"ADD_TEMPORARY_ABSENCE","activeCaseLoadId":"LEI"}`,
        service: 'hmpps-external-movements-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])

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
