import { Request, Response } from 'express'

import { format } from 'date-fns'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { ResQuerySchemaType } from './schema'
import { components } from '../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../utils/utils'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { absenceCategorisationMapper } from '../common/utils'
import { getAbsenceCategorisationsFullSet } from '../temporary-absence-authorisations/utils'

export class BrowseTapOccurrencesController {
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

    const hasValidationError =
      Object.keys(resQuery).find(key => ['searchTerm', 'start', 'end', 'status'].includes(key)) && !resQuery.validated
    const missingDateRange = !resQuery?.validated?.start || !resQuery?.validated?.end

    let results: components['schemas']['TapOccurrenceResult'][] = []
    try {
      const searchResponse =
        !hasValidationError && !missingDateRange
          ? await this.externalMovementsService.searchTapOccurrences(
              { res },
              resQuery.validated?.start ? format(resQuery.validated.start, 'yyyy-MM-dd') : null,
              resQuery.validated?.end ? format(resQuery.validated.end, 'yyyy-MM-dd') : null,
              resQuery.validated?.status ?? [],
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
        `?page={page}&${filterQueries}&sort=${resQuery?.sort ?? 'start,asc'}`,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    const { types, subTypes, reasonCategories, reasons } = await getAbsenceCategorisationsFullSet(
      this.externalMovementsService,
      res,
    )

    res.render('temporary-absences/view', {
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
