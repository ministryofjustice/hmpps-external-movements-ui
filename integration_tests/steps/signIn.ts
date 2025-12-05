import { Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth, { UserToken } from '../mockApis/auth'

export const signIn = async (
  page: Page,
  user: UserToken = { roles: ['EXTERNAL_MOVEMENTS__TAP__RO', 'EXTERNAL_MOVEMENTS__TAP__RW'] },
) => {
  const authCode = uuidV4()
  await auth.stubToken(user, authCode)
  await page.goto(`/sign-in/callback?code=${authCode}`)
}
