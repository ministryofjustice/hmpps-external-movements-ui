import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/externalMovements'
import { parseQueryParams } from '../../utils/utils'

export type UpdateTapAuthorisation = components['schemas']['AuthorisationActions']['actions'][0]

export type UpdateTapOccurrence = components['schemas']['OccurrenceActions']['actions'][0]

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

  async getAbsenceCategoryFilters(context: ApiRequestContext) {
    return this.externalMovementsApiClient
      .withContext(context)
      .get<components['schemas']['AbsenceCategorisationFilters']>({
        path: '/absence-categorisation/filters',
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
    let response: components['schemas']['TapOccurrence'] | undefined
    try {
      response = await this.externalMovementsApiClient
        .withContext(context)
        .get<components['schemas']['TapOccurrence']>({
          path: `/temporary-absence-occurrences/${id}`,
        })
    } catch (error) {
      return this.handleGetError(error)
    }

    if (!context.res.locals.user.caseLoads?.find(caseload => caseload.caseLoadId === response.prison.code)) {
      throw new Error('NOT_AUTHORISED')
    }

    return response
  }

  async getTapOccurrenceHistory(context: ApiRequestContext, id: string) {
    try {
      return await this.externalMovementsApiClient.withContext(context).get<components['schemas']['AuditHistory']>({
        path: `/temporary-absence-occurrences/${id}/history`,
      })
    } catch (error) {
      return this.handleGetError(error)
    }
  }

  async updateTapOccurrence(context: ApiRequestContext, id: string, request: UpdateTapOccurrence) {
    const data: components['schemas']['OccurrenceActions'] = { actions: [request] }
    if (request.reason) data.reason = request.reason

    return this.externalMovementsApiClient.withContext(context).put<components['schemas']['AuditHistory']>({
      path: `/temporary-absence-occurrences/${id}`,
      data,
    })
  }

  async getTapAuthorisation(context: ApiRequestContext, id: string, start?: string | null, end?: string | null) {
    let response: components['schemas']['TapAuthorisation'] | undefined

    try {
      response = await this.externalMovementsApiClient
        .withContext(context)
        .get<components['schemas']['TapAuthorisation']>({
          path: `/temporary-absence-authorisations/${id}${parseQueryParams({ start, end })}`,
        })
    } catch (error) {
      return this.handleGetError(error)
    }

    if (!context.res.locals.user.caseLoads?.find(caseload => caseload.caseLoadId === response.prison.code)) {
      throw new Error('NOT_AUTHORISED')
    }

    return response
  }

  async getTapAuthorisationHistory(context: ApiRequestContext, id: string) {
    try {
      return await this.externalMovementsApiClient.withContext(context).get<components['schemas']['AuditHistory']>({
        path: `/temporary-absence-authorisations/${id}/history`,
      })
    } catch (error) {
      return this.handleGetError(error)
    }
  }

  async updateTapAuthorisation(
    context: ApiRequestContext,
    id: string,
    request: UpdateTapAuthorisation,
    authorisation?: components['schemas']['TapAuthorisation'],
  ) {
    const data: components['schemas']['AuthorisationActions'] = { actions: [request] }
    if (request.reason) data.reason = request.reason

    const isCreatingOccurrences = !!data.actions.find(({ type }) => type === 'CreateOccurrences')

    if (isCreatingOccurrences && !authorisation) {
      throw new Error('Authorisation data is mandatory for CreateOccurrences action to diff the occurrences')
    }

    const result = await this.externalMovementsApiClient
      .withContext(context)
      .put<components['schemas']['AuditHistory']>({
        path: `/temporary-absence-authorisations/${id}`,
        data,
      })

    if (isCreatingOccurrences) {
      const existingIds = authorisation!.occurrences.map(itm => itm.id)

      const occurrenceIds = (await this.getTapAuthorisation(context, id))?.occurrences.map(itm => itm.id) ?? []
      const newOccurrenceIds = occurrenceIds.filter(itm => !existingIds.includes(itm))
      return {
        ...result,
        newOccurrenceIds,
      }
    }

    return result
  }

  searchTapOccurrences(context: ApiRequestContext, request: components['schemas']['TapOccurrenceSearchRequest']) {
    return this.externalMovementsApiClient
      .withContext({ ...context, readOnly: true })
      .post<components['schemas']['TapOccurrenceSearchResponse']>({
        path: '/search/temporary-absence-occurrences',
        data: request,
      })
  }

  searchTapOccurrencesByPrisonNumber(
    context: ApiRequestContext,
    prisonNumber: string,
    request: components['schemas']['PersonTapSearchRequest'],
  ) {
    return this.externalMovementsApiClient
      .withContext({ ...context, readOnly: true })
      .post<components['schemas']['PersonTapSearchResponse']>({
        path: `/search/people/${prisonNumber}/temporary-absence-occurrences`,
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

  async getTapMovement(context: ApiRequestContext, id: string) {
    let response: components['schemas']['TapMovement'] | undefined
    try {
      response = await this.externalMovementsApiClient.withContext(context).get<components['schemas']['TapMovement']>({
        path: `/temporary-absence-movements/${id}`,
      })
    } catch (error) {
      return this.handleGetError(error)
    }

    if (!context.res.locals.user.caseLoads?.find(caseload => caseload.caseLoadId === response.prison.code)) {
      throw new Error('NOT_AUTHORISED')
    }

    return response
  }

  async getTapMovementHistory(context: ApiRequestContext, id: string) {
    try {
      return await this.externalMovementsApiClient.withContext(context).get<components['schemas']['AuditHistory']>({
        path: `/temporary-absence-movements/${id}/history`,
      })
    } catch (error) {
      return this.handleGetError(error)
    }
  }

  async getTapLocations(context: ApiRequestContext) {
    return this.externalMovementsApiClient.withContext(context).get<components['schemas']['TapLocations']>({
      path: `/prisons/${context.res.locals.user.getActiveCaseloadId()}/temporary-absence-locations`,
    })
  }

  async putTapLocations(context: ApiRequestContext, request: components['schemas']['TapLocations']) {
    return this.externalMovementsApiClient.withContext(context).put({
      path: `/prisons/${context.res.locals.user.getActiveCaseloadId()}/temporary-absence-locations`,
      data: request,
    })
  }

  private handleGetError = (error: unknown) => {
    const statusCode = (error as { data?: { status?: number } })?.data?.status
    if (statusCode && statusCode >= 400 && statusCode <= 499) return null
    throw error
  }
}
