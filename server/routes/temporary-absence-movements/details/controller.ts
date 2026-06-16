import { Request, Response } from 'express'
import { getMovementAndPopulatePrisonerDetails } from '../utils'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'
import PrisonerSearchApiService from '../../../services/apis/prisonerSearchService'

export class TapMovementDetailsController {
  constructor(
    readonly externalMovementsService: ExternalMovementsService,
    readonly prisonerSearchApiService: PrisonerSearchApiService,
  ) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    const [movement, history] = await Promise.all([
      getMovementAndPopulatePrisonerDetails(this.externalMovementsService, this.prisonerSearchApiService, req, res),
      this.externalMovementsService.getTapMovementHistory({ res }, req.params.id),
    ])

    if (!movement) {
      res.notFound()
    }

    res.render('temporary-absence-movements/details/view', {
      showBreadcrumbs: true,
      result: movement,
      auditedActions: parseAuditHistory(
        history?.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) ?? [],
      ),
    })
  }
}
