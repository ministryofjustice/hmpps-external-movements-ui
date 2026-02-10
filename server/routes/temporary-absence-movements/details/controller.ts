import { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { getMovementAndPopulatePrisonerDetails } from '../utils'
import { getApiUserErrorMessage } from '../../../utils/utils'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'
import PrisonerSearchApiService from '../../../services/apis/prisonerSearchService'

export class TapMovementDetailsController {
  constructor(
    readonly externalMovementsService: ExternalMovementsService,
    readonly prisonerSearchApiService: PrisonerSearchApiService,
  ) {}

  GET = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const [movement, history] = await Promise.all([
        getMovementAndPopulatePrisonerDetails(this.externalMovementsService, this.prisonerSearchApiService, req, res),
        this.externalMovementsService.getTapMovementHistory({ res }, req.params.id),
      ])

      res.render('temporary-absence-movements/details/view', {
        showBreadcrumbs: true,
        result: movement,
        auditedActions: parseAuditHistory(history.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))),
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
