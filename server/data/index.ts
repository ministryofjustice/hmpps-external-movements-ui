/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import ExternalMovementsApiClient from '../services/externalMovementsApi/externalMovementsApiClient'
import PrisonerSearchApiClient from '../services/prisonerSearch/prisonerSearchApiClient'

const redisClient = config.redis.enabled ? createRedisClient() : null
const tokenStore = redisClient ? new RedisTokenStore(redisClient) : new InMemoryTokenStore()

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)

  return {
    applicationInfo,
    hmppsAuthClient,
    externalMovementsApiClient: new ExternalMovementsApiClient(hmppsAuthClient),
    prisonerSearchApiClient: new PrisonerSearchApiClient(hmppsAuthClient),
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    tokenStore,
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { AuthenticationClient, HmppsAuditClient, ExternalMovementsApiClient, tokenStore }
