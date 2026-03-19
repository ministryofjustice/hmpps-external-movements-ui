import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { SelectDocumentTypePage } from './test.page'
import {
  stubGetTemplateDetail,
  stubGetTemplates,
} from '../../../../../integration_tests/mockApis/documentGenerationApi'
import { testTemplateDetail } from '../../../../../integration_tests/data/documentGenerationTestData'

test.describe('/tap-documents/select-document-type', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTemplates(),
      stubGetTemplateDetail(testTemplateDetail),
      stubGetTemplateDetail({
        ...testTemplateDetail,
        id: 'template-2',
        variables: {
          domains: [
            {
              code: 'PERSON',
              description: 'Prisoner details',
              variables: [
                {
                  code: 'perName',
                  description: 'Full name',
                  type: 'STRING',
                },
              ],
            },
          ],
        },
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()

    // start journey
    await page.goto(`/${journeyId}/tap-documents/start/${prisonNumber}`)

    // verify page content
    const testPage = await new SelectDocumentTypePage(page).verifyContent()

    await expect(testPage.documentTypeInput()).toBeVisible()
    await expect(testPage.documentTypeInput()).toHaveValue('')
    await expect(testPage.continueButton()).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select a document type').click()
    await expect(testPage.documentTypeInput()).toBeFocused()

    // verify next page routing
    await testPage.documentTypeInput().selectOption('template-1')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/tap-documents\/select-absence-plan/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.documentTypeInput()).toHaveValue('template-1')
  })

  test('should try alternative routing to download document page if template does not require absence plan data', async ({
    page,
  }) => {
    const journeyId = uuidV4()

    // start journey
    await page.goto(`/${journeyId}/tap-documents/start/${prisonNumber}`)

    // verify page content
    const testPage = await new SelectDocumentTypePage(page).verifyContent()

    // verify next page routing
    await testPage.documentTypeInput().selectOption('template-2')
    await testPage.clickContinue()
    expect(page.url()).toContain(
      `/document-generation-ui/download-document/template-2?prisonId=LEI&prisonNumber=${prisonNumber}`,
    )
  })
})
