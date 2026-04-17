import { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { isFuture } from 'date-fns'
import { getAuthorisationAndPopulatePrisonerDetails } from '../utils'
import { ResQuerySchemaType } from './schema'
import { getApiUserErrorMessage, isTapAuthorisationEditable } from '../../../utils/utils'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'
import PrisonerSearchApiService from '../../../services/apis/prisonerSearchService'

export class TapAuthorisationDetailsController {
  constructor(
    readonly externalMovementsService: ExternalMovementsService,
    readonly prisonerSearchApiService: PrisonerSearchApiService,
  ) {}

  GET = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo, validated } = (res.locals['query'] ?? {}) as ResQuerySchemaType

      const [authorisation, history] = await Promise.all([
        getAuthorisationAndPopulatePrisonerDetails(
          this.externalMovementsService,
          this.prisonerSearchApiService,
          req,
          res,
          validated?.dateFrom,
          validated?.dateTo,
        ),
        this.externalMovementsService.getTapAuthorisationHistory({ res }, req.params.id),
      ])

      const editable = isTapAuthorisationEditable(authorisation)
      const approvable =
        authorisation.status.code === 'PENDING' &&
        editable &&
        authorisation.locations.find(
          ({ uprn, address, description, postcode }) =>
            uprn || description?.length || address?.length || postcode?.length,
        )
      const cancellable =
        (authorisation.status.code === 'APPROVED' || authorisation.status.code === 'PAUSED') &&
        (authorisation.repeat ||
          !['IN_PROGRESS', 'OVERDUE', 'COMPLETED'].includes(authorisation.occurrences[0]?.status.code ?? ''))
      const pausable =
        authorisation.status.code === 'APPROVED' &&
        authorisation.occurrences.every(({ status }) => !['IN_PROGRESS', 'OVERDUE'].includes(status.code))
      const resumable = authorisation.status.code === 'PAUSED'

      const futureOccurrences = authorisation.occurrences.filter(({ end }) => isFuture(end))
      const singleFutureAddress =
        futureOccurrences.length &&
        futureOccurrences.every(
          ({ location }) =>
            futureOccurrences[0]!.location.address === location.address &&
            futureOccurrences[0]!.location.description === location.description &&
            futureOccurrences[0]!.location.postcode === location.postcode &&
            futureOccurrences[0]!.location.uprn === location.uprn,
        )

      res.render('temporary-absence-authorisations/details/view', {
        showBreadcrumbs: true,
        result: authorisation,
        dateFrom,
        dateTo,
        auditedActions: parseAuditHistory(history.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))),
        editable,
        approvable,
        cancellable,
        pausable,
        resumable,
        singleFutureAddress,
      })
    } catch (error: unknown) {
      if ((error as { message?: string }).message) {
        next(error)
      } else {
        res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
        res.notFound()
      }
    }
  }
}
