import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { getMovementAndPopulatePrisonerDetails } from '../utils'
import { getApiUserErrorMessage } from '../../../utils/utils'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'

export class TapMovementDetailsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const [movement, history] = await Promise.all([
        getMovementAndPopulatePrisonerDetails(this.externalMovementsService, req, res),
        this.externalMovementsService.getTapMovementHistory({ res }, req.params.id),
      ])

      res.render('temporary-absence-movements/details/view', {
        showBreadcrumbs: true,
        result: movement,
        auditedActions: parseAuditHistory(history.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))),
      })
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
      res.notFound()
    }
  }
}
