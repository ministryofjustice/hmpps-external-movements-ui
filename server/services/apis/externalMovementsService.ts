import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/externalMovements'
import { parseQueryParams } from '../../utils/utils'

export type UpdateTapAuthorisation =
  | components['schemas']['AmendAuthorisationNotes']
  | components['schemas']['ApproveAuthorisation']
  | components['schemas']['CancelAuthorisation']
  | components['schemas']['ChangeAuthorisationDateRange']
  | components['schemas']['RecategoriseAuthorisation']
  | components['schemas']['DenyAuthorisation']

export type UpdateTapOccurrence =
  | components['schemas']['AmendOccurrenceNotes']
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

  async getTapAuthorisation(context: ApiRequestContext, id: string, fromDate?: string | null, toDate?: string | null) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['TapAuthorisation']>({
      path: `/temporary-absence-authorisations/${id}${parseQueryParams({ fromDate, toDate })}`,
    })
  }

  async updateTapAuthorisation(context: ApiRequestContext, id: string, request: UpdateTapAuthorisation) {
    return this.externalMovementsApiClient.withContext(context).put<components['schemas']['AuditHistory']>({
      path: `/temporary-absence-authorisations/${id}`,
      data: request,
    })
  }

  searchTapOccurrences(
    context: ApiRequestContext,
    fromDate: string | null | undefined,
    toDate: string | null | undefined,
    status: string[],
    query: string | null,
    sort: string,
    page: number,
    pageSize: number,
  ) {
    return this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['TapOccurrenceSearchResponse']>({
        path: `/search/temporary-absence-occurrences${parseQueryParams({
          prisonCode: context.res.locals.user.getActiveCaseloadId(),
          fromDate,
          toDate,
          status,
          sort,
          page,
          size: pageSize,
          query,
        })}`,
      })
  }

  searchTapAuthorisations(
    context: ApiRequestContext,
    fromDate: string | null | undefined,
    toDate: string | null | undefined,
    status: string[],
    query: string | null,
    sort: string,
    page: number,
    pageSize: number,
  ) {
    return this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['TapAuthorisationSearchResponse']>({
        path: `/search/temporary-absence-authorisations${parseQueryParams({
          prisonCode: context.res.locals.user.getActiveCaseloadId(),
          fromDate,
          toDate,
          status,
          sort,
          page,
          size: pageSize,
          query,
        })}`,
      })
  }
}
