/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
const telemetryClient = buildAppInsightsClient(applicationInfo)!

// eslint-disable-next-line import/order
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import CacheInterface from './cache/cacheInterface'
import RedisCache from './cache/redisCache'
import InMemoryCache from './cache/inMemoryCache'

const redisClient = config.redis.enabled ? createRedisClient() : null
const tokenStore = redisClient ? new RedisTokenStore(redisClient) : new InMemoryTokenStore()

export const dataAccess = () => {
  const authenticationClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)

  return {
    applicationInfo,
    authenticationClient,
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    tokenStore,
    telemetryClient,
    cacheStore: <T>(prefix: string): CacheInterface<T> =>
      redisClient ? new RedisCache<T>(redisClient, prefix) : new InMemoryCache<T>(prefix),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { AuthenticationClient, HmppsAuditClient, tokenStore }
