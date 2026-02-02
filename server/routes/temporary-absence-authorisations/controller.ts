import { Request, Response } from 'express'

import { format } from 'date-fns'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { ResQuerySchemaType } from './schema'
import { components } from '../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../utils/utils'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { absenceCategorisationMapper } from '../common/utils'

export class BrowseTapAuthorisationsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  private PAGE_SIZE = 25

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType
    if (resQuery) {
      if (!resQuery.status) {
        resQuery.status = []
      } else if (!Array.isArray(resQuery.status)) {
        resQuery.status = [resQuery.status]
      }

      if (resQuery.searchTerm?.trim()) {
        res.setAuditDetails.searchTerm(resQuery.searchTerm.trim())
      }
    }

    const filterQueries = [
      `searchTerm=${resQuery?.searchTerm ?? ''}`,
      `start=${resQuery?.start ?? ''}`,
      `end=${resQuery?.end ?? ''}`,
      `type=${resQuery?.type ?? ''}`,
      `subType=${resQuery?.subType ?? ''}`,
      `reason=${resQuery?.reason ?? ''}`,
      `workType=${resQuery?.workType ?? ''}`,
      ...(resQuery?.status?.map(itm => `status=${itm}`) ?? []),
    ].join('&')

    const {
      types,
      subTypes,
      reasons: reasonCategories,
      workTypes: reasons,
    } = await this.externalMovementsService.getAbsenceCategoryFilters({ res })

    const hasValidationError =
      Object.keys(resQuery).find(key => ['searchTerm', 'start', 'end', 'status'].includes(key)) && !resQuery.validated
    const missingDateRange =
      !resQuery.validated?.searchTerm?.match(/[a-zA-Z][0-9]{4}[a-zA-Z]{2}/) &&
      (!resQuery?.validated?.start || !resQuery?.validated?.end)

    let searchResponse: components['schemas']['TapAuthorisationSearchResponse'] | undefined
    let results: components['schemas']['TapAuthorisationResult'][] = []

    try {
      if (!hasValidationError && resQuery.validated) {
        const requestBody: components['schemas']['TapAuthorisationSearchRequest'] = {
          prisonCode: res.locals.user.getActiveCaseloadId()!,
          status: resQuery.validated?.status ?? [],
          sort: resQuery.validated?.sort ?? 'start,asc',
          page: resQuery.validated?.page || 1,
          size: this.PAGE_SIZE,
        } as components['schemas']['TapAuthorisationSearchRequest'] // TODO: remove unnecessary type case after API change
        if (resQuery.validated.start) requestBody.start = format(resQuery.validated.start, 'yyyy-MM-dd')
        if (resQuery.validated.end) requestBody.end = format(resQuery.validated.end, 'yyyy-MM-dd')

        if (resQuery.validated.searchTerm?.trim()) {
          requestBody.query = resQuery.validated?.searchTerm?.trim()
        }

        if (resQuery.validated.workType) {
          requestBody.absenceCategorisation = {
            domainCode: reasons.find(({ code }) => code === resQuery.validated!.workType)!.domainCode,
            codes: [resQuery.validated.workType],
          }
        } else if (resQuery.validated.reason) {
          requestBody.absenceCategorisation = {
            domainCode: reasonCategories.find(({ code }) => code === resQuery.validated!.reason)!.domainCode,
            codes: [resQuery.validated.reason],
          }
        } else if (resQuery.validated.subType) {
          requestBody.absenceCategorisation = {
            domainCode: subTypes.find(({ code }) => code === resQuery.validated!.subType)!.domainCode,
            codes: [resQuery.validated.subType],
          }
        } else if (resQuery.validated.type) {
          requestBody.absenceCategorisation = {
            domainCode: types.find(({ code }) => code === resQuery.validated!.type)!.domainCode,
            codes: [resQuery.validated.type],
          }
        }

        searchResponse = await this.externalMovementsService.searchTapAuthorisations({ res }, requestBody)
        results = searchResponse?.content ?? []
      } else {
        results = []
      }

      setPaginationLocals(
        res,
        this.PAGE_SIZE,
        resQuery?.validated?.page ?? 1,
        searchResponse?.metadata?.totalElements ?? 0,
        results.length,
        `?page={page}&${filterQueries}&sort=${resQuery?.sort ?? 'start,asc'}`,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('temporary-absence-authorisations/view', {
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      start: resQuery?.start,
      end: resQuery?.end,
      status: resQuery?.status,
      type: !resQuery?.workType && !resQuery?.reason && !resQuery?.subType && resQuery?.type,
      subType: !resQuery?.workType && !resQuery?.reason && resQuery?.subType,
      reason: !resQuery?.workType && resQuery?.reason,
      workType: resQuery?.workType,
      results,
      filterQueries,
      sort: resQuery?.sort ?? 'start,asc',
      hasValidationError,
      missingDateRange,
      types: types.map(absenceCategorisationMapper),
      subTypes: subTypes.map(absenceCategorisationMapper),
      reasons: reasonCategories.map(absenceCategorisationMapper),
      workTypes: reasons.map(absenceCategorisationMapper),
    })
  }
}
