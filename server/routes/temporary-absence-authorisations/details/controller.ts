import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { getAuthorisationAndPopulatePrisonerDetails } from '../utils'
import { ResQuerySchemaType } from './schema'
import { getApiUserErrorMessage } from '../../../utils/utils'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'

export class TapAuthorisationDetailsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { dateFrom, dateTo, validated } = (res.locals['query'] ?? {}) as ResQuerySchemaType

      const [authorisation, history] = await Promise.all([
        getAuthorisationAndPopulatePrisonerDetails(
          this.externalMovementsService,
          req,
          res,
          validated?.dateFrom,
          validated?.dateTo,
        ),
        this.externalMovementsService.getTapAuthorisationHistory({ res }, req.params.id),
      ])

      res.render('temporary-absence-authorisations/details/view', {
        showBreadcrumbs: true,
        result: authorisation,
        dateFrom,
        dateTo,
        auditHistory: parseAuditHistory(history.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))),
      })
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
      res.notFound()
    }
  }
}
