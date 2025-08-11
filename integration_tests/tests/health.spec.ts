import { expect, test } from '@playwright/test'
import { resetStubs } from '../mockApis/wiremock'
import auth from '../mockApis/auth'
import componentsApi from '../mockApis/componentsApi'
import tokenVerification from '../mockApis/tokenVerification'
import externalMovementsApi from '../mockApis/externalMovementsApi'

test.describe('Healthcheck', () => {
  test.describe('All healthy', () => {
    test.beforeEach(async () => {
      await resetStubs()
      await Promise.all([
        auth.stubAuthPing(),
        tokenVerification.stubTokenVerificationPing(),
        externalMovementsApi.stubExternalMovementsPing(),
        componentsApi.stubComponents(),
      ])
    })

    test('Health check page is visible and UP', async ({ request }) => {
      const response = await (await request.get('/health')).json()
      expect(response.status).toEqual('UP')
    })

    test('Ping is visible and UP', async ({ request }) => {
      const response = await (await request.get('/ping')).json()
      expect(response.status).toEqual('UP')
    })

    test('Info is visible', async ({ request }) => {
      const response = await (await request.get('/info')).json()
      expect(response.build.name).toEqual('hmpps-external-movements-ui')
    })
  })

  test.describe('Some unhealthy', () => {
    test.beforeEach(async () => {
      await resetStubs()
      await Promise.all([auth.stubAuthPing(), tokenVerification.stubTokenVerificationPing(500)])
    })

    test('Reports correctly when token verification down', async ({ request }) => {
      const response = await (await request.get('/health')).json()
      expect(response.components.hmppsAuth.status).toEqual('UP')
      expect(response.components.tokenVerification.status).toEqual('DOWN')
      expect(response.components.tokenVerification.details).toEqual({
        status: 500,
        attempts: 3,
        message: expect.any(String),
      })
    })

    test('Health check page is visible and DOWN', async ({ request }) => {
      const response = await (await request.get('/health')).json()
      expect(response.status).toEqual('DOWN')
    })
  })
})
