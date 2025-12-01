import { Request, Response } from 'express'

import { format } from 'date-fns'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { ResQuerySchemaType } from './schema'
import { components } from '../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../utils/utils'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'

export class BrowseTapAuthorisationsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  private PAGE_SIZE = 25

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType
    const filterQueries = [
      `searchTerm=${resQuery?.searchTerm ?? ''}`,
      `fromDate=${resQuery?.fromDate ?? ''}`,
      `toDate=${resQuery?.toDate ?? ''}`,
      `status=${resQuery?.status ?? ''}`,
    ].join('&')

    const hasValidationError = resQuery && !resQuery.validated

    let results: components['schemas']['TapAuthorisationResult'][] = []

    try {
      const searchResponse = !hasValidationError
        ? await this.externalMovementsService.searchTapAuthorisations(
            { res },
            resQuery?.validated?.fromDate ? format(resQuery.validated.fromDate, 'yyyy-MM-dd') : null,
            resQuery?.validated?.toDate ? format(resQuery.validated.toDate, 'yyyy-MM-dd') : null,
            resQuery?.validated?.status ? [resQuery.validated.status] : ['PENDING', 'APPROVED', 'CANCELLED', 'DENIED'],
            resQuery?.validated?.searchTerm?.trim() || null,
            resQuery?.validated?.sort ?? 'fromDate,asc',
            resQuery?.validated?.page || 1,
            this.PAGE_SIZE,
          )
        : undefined
      results = searchResponse?.content ?? []

      setPaginationLocals(
        res,
        this.PAGE_SIZE,
        resQuery?.validated?.page ?? 1,
        searchResponse?.metadata?.totalElements ?? 0,
        results.length,
        `?page={page}&${filterQueries}`,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('temporary-absence-authorisations/view', {
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      fromDate: resQuery?.fromDate,
      toDate: resQuery?.toDate,
      status: resQuery?.status,
      results,
      filterQueries,
      sort: resQuery?.sort ?? 'fromDate,asc',
      hasValidationError,
    })
  }
}
