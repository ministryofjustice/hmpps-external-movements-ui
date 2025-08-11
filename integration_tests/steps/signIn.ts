import { Page } from '@playwright/test'
import auth from '../mockApis/auth'

export const signIn = async (page: Page) => {
  await page.goto('/')
  await page.goto(await auth.getSignInUrl())
}
