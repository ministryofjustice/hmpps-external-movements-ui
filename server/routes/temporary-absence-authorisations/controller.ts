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
      `start=${resQuery?.start ?? ''}`,
      `end=${resQuery?.end ?? ''}`,
      `status=${resQuery?.status ?? ''}`,
    ].join('&')

    const hasValidationError =
      Object.keys(resQuery).find(key => ['searchTerm', 'start', 'end', 'status'].includes(key)) && !resQuery.validated

    let results: components['schemas']['TapAuthorisationResult'][] = []

    try {
      const searchResponse = !hasValidationError
        ? await this.externalMovementsService.searchTapAuthorisations(
            { res },
            resQuery.validated?.start ? format(resQuery.validated.start, 'yyyy-MM-dd') : null,
            resQuery.validated?.end ? format(resQuery.validated.end, 'yyyy-MM-dd') : null,
            resQuery.validated?.status
              ? [resQuery.validated.status]
              : ['PENDING', 'APPROVED', 'CANCELLED', 'DENIED', 'EXPIRED'],
            resQuery.validated?.searchTerm?.trim() || null,
            resQuery.validated?.sort ?? 'start,asc',
            resQuery.validated?.page || 1,
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
      start: resQuery?.start,
      end: resQuery?.end,
      status: resQuery?.status,
      results,
      filterQueries,
      sort: resQuery?.sort ?? 'start,asc',
      hasValidationError,
    })
  }
}
