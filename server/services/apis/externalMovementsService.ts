import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/externalMovements'

export default class ExternalMovementsService {
  private externalMovementsApiClient: CustomRestClient

  constructor(authenticationClient: AuthenticationClient) {
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
  }

  async getAllAbsenceTypes(context: ApiRequestContext) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['AbsenceCategorisations']>({
      path: '/absence-categorisation/ABSENCE_TYPE',
    })
  }

  async getAbsenceCategories(
    context: ApiRequestContext,
    parentDomain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY',
    parentCode: string,
  ) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['AbsenceCategorisations']>({
      path: `/absence-categorisation/${parentDomain}/${parentCode}`,
    })
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
    return (
      await this.externalMovementsApiClient.withContext(context).get<components['schemas']['ReferenceDataResponse']>({
        path: `/reference-data/${domain}`,
      })
    ).items
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

  async getTapAuthorisation(context: ApiRequestContext, id: string) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['TapAuthorisation']>({
      path: `/temporary-absence-authorisations/${id}`,
    })
  }

  searchTapOccurrences(context: ApiRequestContext, fromDate: string, toDate: string, query: string | null) {
    const searchParams: string[] = [
      `prisonCode=${context.res.locals.user.getActiveCaseloadId()}`,
      `fromDate=${fromDate}`,
      `toDate=${toDate}`,
      'page=1',
      'size=2147483647',
    ]
    if (query) searchParams.push(`query=${encodeURIComponent(query)}`)

    return this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['TapOccurrenceSearchResponse']>({
        path: `/search/temporary-absence-occurrences?${searchParams.join('&')}`,
      })
  }

  searchTapAuthorisations(
    context: ApiRequestContext,
    fromDate: string,
    toDate: string,
    status: string[],
    query: string | null,
  ) {
    const searchParams: string[] = [
      `prisonCode=${context.res.locals.user.getActiveCaseloadId()}`,
      `fromDate=${fromDate}`,
      `toDate=${toDate}`,
      ...status.map(val => `status=${val}`),
      'page=1',
      'size=2147483647',
    ]
    if (query) searchParams.push(`query=${encodeURIComponent(query)}`)

    return this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['TapAuthorisationSearchResponse']>({
        path: `/search/temporary-absence-authorisations?${searchParams.join('&')}`,
      })
  }
}
