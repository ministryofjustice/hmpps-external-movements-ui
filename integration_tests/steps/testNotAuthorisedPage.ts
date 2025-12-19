import { Page } from '@playwright/test'
import auth from '../mockApis/auth'
import componentsApi from '../mockApis/componentsApi'
import { signIn } from './signIn'
import { NotAuthorisedPage } from '../pages/NotAuthorisedPage'

export const testNotAuthorisedPage = async (
  page: Page,
  url: string,
  roles: string[] = ['EXTERNAL_MOVEMENTS_TAP_RO'],
) => {
  await Promise.all([auth.stubSignIn(), componentsApi.stubComponents()])
  await signIn(page, { roles })
  await page.goto(url)
  await new NotAuthorisedPage(page).verifyContent()
}
