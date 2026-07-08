import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { OsPlacesApiClient } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import CacheInterface from './cache/cacheInterface'
import RedisCache from './cache/redisCache'
import InMemoryCache from './cache/inMemoryCache'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

const redisClient = config.redis.enabled ? createRedisClient() : null
const tokenStore = redisClient ? new RedisTokenStore(redisClient) : new InMemoryTokenStore()

export const dataAccess = () => {
  const authenticationClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)

  return {
    applicationInfo,
    authenticationClient,
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    osPlacesApiClient: new OsPlacesApiClient(logger, config.apis.osPlacesApi),
    tokenStore,
    cacheStore: <T>(prefix: string): CacheInterface<T> =>
      redisClient ? new RedisCache<T>(redisClient, prefix) : new InMemoryCache<T>(prefix),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { AuthenticationClient, HmppsAuditClient, tokenStore }
