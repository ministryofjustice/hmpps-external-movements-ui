import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/externalMovements'
import { parseQueryParams } from '../../utils/utils'
import CacheInterface from '../../data/cache/cacheInterface'

export type UpdateTapAuthorisation =
  | components['schemas']['ChangeAuthorisationComments']
  | components['schemas']['ApproveAuthorisation']
  | components['schemas']['CancelAuthorisation']
  | components['schemas']['ChangeAuthorisationAccompaniment']
  | components['schemas']['ChangeAuthorisationDateRange']
  | components['schemas']['ChangeAuthorisationTransport']
  | components['schemas']['ChangePrisonPerson']
  | components['schemas']['DenyAuthorisation']
  | components['schemas']['RecategoriseAuthorisation']

export type UpdateTapOccurrence =
  | components['schemas']['ChangeOccurrenceComments']
  | components['schemas']['CancelOccurrence']
  | components['schemas']['ChangeOccurrenceAccompaniment']
  | components['schemas']['ChangeOccurrenceContactInformation']
  | components['schemas']['ChangeOccurrenceLocation']
  | components['schemas']['ChangeOccurrenceTransport']
  | components['schemas']['ExpireOccurrence']
  | components['schemas']['MarkOccurrenceOverdue']
  | components['schemas']['RecategoriseOccurrence']
  | components['schemas']['RescheduleOccurrence']
  | components['schemas']['ScheduleOccurrence']

export default class ExternalMovementsService {
  private externalMovementsApiClient: CustomRestClient

  private categorisationCache: CacheInterface<components['schemas']['AbsenceCategorisations']>

  private referenceDataCache: CacheInterface<components['schemas']['ReferenceDataResponse']>

  private readonly REFERENCE_DATA_CACHE_TIMEOUT = Number(process.env['REFERENCE_DATA_CACHE_TIMEOUT'] ?? 600)

  constructor(
    authenticationClient: AuthenticationClient,
    cacheStore: (prefix: string) => CacheInterface<components['schemas']['AbsenceCategorisations']>,
  ) {
    this.externalMovementsApiClient = new CustomRestClient(
      'External Movements API',
      config.apis.externalMovementsApi,
      logger,
      authenticationClient,
      true,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
    this.categorisationCache = cacheStore('categorisation')
    this.referenceDataCache = cacheStore('reference-data')
  }

  async getAllAbsenceTypes(context: ApiRequestContext) {
    const cacheKey = 'TOP'
    const cached = await this.categorisationCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = await this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['AbsenceCategorisations']>({
        path: '/absence-categorisation/ABSENCE_TYPE',
      })

    await this.categorisationCache.set(cacheKey, result, this.REFERENCE_DATA_CACHE_TIMEOUT)

    return result
  }

  async getAbsenceCategories(
    context: ApiRequestContext,
    parentDomain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY',
    parentCode: string,
  ) {
    const cacheKey = `${parentDomain}.${parentCode}`
    const cached = await this.categorisationCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = await this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['AbsenceCategorisations']>({
        path: `/absence-categorisation/${parentDomain}/${parentCode}`,
      })

    await this.categorisationCache.set(cacheKey, result, this.REFERENCE_DATA_CACHE_TIMEOUT)

    return result
  }

  async createTap(
    context: ApiRequestContext,
    prisonNumber: string,
    request: components['schemas']['CreateTapAuthorisationRequest'],
  ) {
    return this.externalMovementsApiClient.withContext(context).post<components['schemas']['ReferenceId']>({
      path: `/temporary-absence-authorisations/${prisonNumber}`,
      data: request,
    })
  }

  async getReferenceData(context: ApiRequestContext, domain: string) {
    const cached = await this.categorisationCache.get(domain)
    if (cached) {
      return cached.items
    }

    const result = await this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['ReferenceDataResponse']>({
        path: `/reference-data/${domain}`,
      })

    await this.referenceDataCache.set(domain, result, this.REFERENCE_DATA_CACHE_TIMEOUT)

    return result.items
  }

  async getTapOverview(context: ApiRequestContext) {
    return this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['PrisonExternalMovementOverview']>({
        path: `/prisons/${context.res.locals.user.getActiveCaseloadId()}/external-movements/overview`,
      })
  }

  async getTapOccurrence(context: ApiRequestContext, id: string) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['TapOccurrence']>({
      path: `/temporary-absence-occurrences/${id}`,
    })
  }

  async getTapOccurrenceHistory(context: ApiRequestContext, id: string) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['AuditHistory']>({
      path: `/temporary-absence-occurrences/${id}/history`,
    })
  }

  async updateTapOccurrence(context: ApiRequestContext, id: string, request: UpdateTapOccurrence) {
    return this.externalMovementsApiClient.withContext(context).put<components['schemas']['AuditHistory']>({
      path: `/temporary-absence-occurrences/${id}`,
      data: request,
    })
  }

  async addTapOccurrence(
    context: ApiRequestContext,
    authorisationId: string,
    request: components['schemas']['CreateOccurrenceRequest'],
  ) {
    return this.externalMovementsApiClient.withContext(context).post<components['schemas']['ReferenceId']>({
      path: `/temporary-absence-authorisations/${authorisationId}/occurrences`,
      data: request,
    })
  }

  async getTapAuthorisation(context: ApiRequestContext, id: string, start?: string | null, end?: string | null) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['TapAuthorisation']>({
      path: `/temporary-absence-authorisations/${id}${parseQueryParams({ start, end })}`,
    })
  }

  async getTapAuthorisationHistory(context: ApiRequestContext, id: string) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['AuditHistory']>({
      path: `/temporary-absence-authorisations/${id}/history`,
    })
  }

  async updateTapAuthorisation(context: ApiRequestContext, id: string, request: UpdateTapAuthorisation) {
    return this.externalMovementsApiClient.withContext(context).put<components['schemas']['AuditHistory']>({
      path: `/temporary-absence-authorisations/${id}`,
      data: request,
    })
  }

  searchTapOccurrences(context: ApiRequestContext, request: components['schemas']['TapOccurrenceSearchRequest']) {
    return this.externalMovementsApiClient
      .withContext({ ...context, readOnly: true })
      .post<components['schemas']['TapOccurrenceSearchResponse']>({
        path: '/search/temporary-absence-occurrences',
        data: request,
      })
  }

  searchTapAuthorisations(context: ApiRequestContext, request: components['schemas']['TapAuthorisationSearchRequest']) {
    return this.externalMovementsApiClient
      .withContext({ ...context, readOnly: true })
      .post<components['schemas']['TapAuthorisationSearchResponse']>({
        path: '/search/temporary-absence-authorisations',
        data: request,
      })
  }
}
