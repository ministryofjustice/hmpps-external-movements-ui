import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
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

  GET = async (req: Request<{ id: string }>, res: Response) => {
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

      if (!res.locals.user.caseLoads?.find(caseLoad => caseLoad.caseLoadId === authorisation.prisonCode)) {
        res.notAuthorised()
        return
      }

      res.render('temporary-absence-authorisations/details/view', {
        showBreadcrumbs: true,
        result: authorisation,
        dateFrom,
        dateTo,
        auditedActions: parseAuditHistory(history.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))),
        editable: isTapAuthorisationEditable(authorisation),
      })
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
      res.notFound()
    }
  }
}
