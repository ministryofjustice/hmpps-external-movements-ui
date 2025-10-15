import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../../config'
import logger from '../../../logger'
import { ApiRequestContext } from '../../data/customRestClient'
import CacheInterface from '../../data/cache/cacheInterface'
import { ADDRESS_REFERENCE_DATA } from '../../data/addressReferenceData'

export type AddressReferenceData = {
  referenceCodeId: number
  groupCode: string
  code: string
  description: string
  displayOrder: number
  isActive: boolean
}

export default class PersonalRelationshipsService {
  private apiClient: RestClient

  constructor(
    private cache: CacheInterface<{ code: string; description: string }[]>,
    authenticationClient: AuthenticationClient,
  ) {
    this.apiClient = new RestClient(
      'Personal Relationships API',
      config.apis.personalRelationshipsApi,
      logger,
      authenticationClient,
    )
  }

  async getReferenceData({ res }: ApiRequestContext, domain: 'CITY' | 'COUNTY' | 'COUNTRY') {
    const cached = await this.cache.get(domain)
    if (cached) return cached

    try {
      const refData = (
        await this.apiClient.get<AddressReferenceData[]>(
          { path: `/reference-codes/group/${domain}` },
          asSystem(res.locals.user.username),
        )
      ).map(({ code, description }) => ({ code, description }))

      await this.cache.set(domain, refData, config.apis.personalRelationshipsApi.referenceDataCacheTTL)
      return refData
    } catch {
      return ADDRESS_REFERENCE_DATA[domain]
    }
  }
}
