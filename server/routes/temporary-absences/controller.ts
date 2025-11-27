import { Request, Response } from 'express'

import { format } from 'date-fns'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { ResQuerySchemaType } from './schema'
import { components } from '../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../utils/utils'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'

export class BrowseTapOccurrencesController {
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

    let results: components['schemas']['TapOccurrenceResult'][] = []
    try {
      const searchResponse =
        resQuery?.validated?.toDate && resQuery?.validated?.fromDate
          ? await this.externalMovementsService.searchTapOccurrences(
              { res },
              format(resQuery.validated.fromDate, 'yyyy-MM-dd'),
              format(resQuery.validated.toDate, 'yyyy-MM-dd'),
              resQuery.validated.status
                ? [resQuery.validated.status]
                : ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'EXPIRED', 'CANCELLED', 'DENIED'],
              resQuery.validated.searchTerm?.trim() || null,
              resQuery.validated.sort ?? 'releaseAt,asc',
              resQuery.validated.page,
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

    res.render('temporary-absences/view', {
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      fromDate: resQuery?.fromDate,
      toDate: resQuery?.toDate,
      status: resQuery?.status,
      results,
      filterQueries,
      sort: resQuery?.sort ?? 'releaseAt,asc',
    })
  }
}
