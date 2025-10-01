import { Request, Response } from 'express'

import { format } from 'date-fns'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { ResQuerySchemaType } from './schema'
import { components } from '../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../utils/utils'

export class BrowseTapOccurrencesController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    let results: components['schemas']['TapOccurrenceResult'][] = []
    try {
      results =
        resQuery?.validated?.toDate && resQuery?.validated?.fromDate
          ? (
              await this.externalMovementsService.searchTapOccurrences(
                { res },
                format(resQuery.validated.fromDate, 'yyyy-MM-dd'),
                format(resQuery.validated.toDate, 'yyyy-MM-dd'),
                resQuery.validated.searchTerm?.trim() || null,
              )
            ).content
          : []
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('temporary-absences/view', {
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      fromDate: resQuery?.fromDate,
      toDate: resQuery?.toDate,
      status: resQuery?.status,
      direction: resQuery?.direction,
      results,
    })
  }
}
