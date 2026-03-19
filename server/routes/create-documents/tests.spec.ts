import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import componentsApi from '../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../integration_tests/steps/signIn'
import { testTapAuthorisation } from '../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../integration_tests/mockApis/prisonApi'
import { CreateDocumentPage } from './test.page'
import { stubGetTemplates } from '../../../integration_tests/mockApis/documentGenerationApi'
import { stubGetTapAuthorisation } from '../../../integration_tests/mockApis/externalMovementsApi'

test.describe('/create-documents/temporary-absence', () => {
  const authorisationId = uuidV4()

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: testTapAuthorisation.person.personIdentifier }),
      stubGetTapAuthorisation({
        ...testTapAuthorisation,
        id: authorisationId,
      }),
      stubGetTemplates(),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should try all cases', async ({ page }) => {
    await page.goto(`/create-documents/temporary-absence/${authorisationId}`)

    // verify page content
    const testPage = await new CreateDocumentPage(page).verifyContent()

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
    expect(page.url()).toContain(
      `/document-generation-ui/download-document/template-1?prisonId=LEI&prisonNumber=${testTapAuthorisation.person.personIdentifier}&absenceId=${authorisationId}`,
    )
  })
})
