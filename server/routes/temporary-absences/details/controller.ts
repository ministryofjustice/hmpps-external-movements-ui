import { Request, Response } from 'express'
import { HTTPError } from 'superagent'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { getApiUserErrorMessage, isTapAuthorisationEditable, isTapOccurrenceEditable } from '../../../utils/utils'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'
import PrisonerSearchApiService from '../../../services/apis/prisonerSearchService'

export class TapOccurrenceDetailsController {
  constructor(
    readonly externalMovementsService: ExternalMovementsService,
    readonly prisonerSearchApiService: PrisonerSearchApiService,
  ) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const [occurrence, history] = await Promise.all([
        this.externalMovementsService.getTapOccurrence({ res }, req.params.id),
        this.externalMovementsService.getTapOccurrenceHistory({ res }, req.params.id),
      ])

      if (!res.locals.user.caseLoads?.find(caseLoad => caseLoad.caseLoadId === occurrence.prisonCode)) {
        res.notAuthorised()
        return
      }

      res.locals.prisonerDetails = await this.prisonerSearchApiService.getPrisonerDetails(
        { res },
        occurrence.authorisation.person.personIdentifier,
      )

      res.render('temporary-absences/details/view', {
        showBreadcrumbs: true,
        result: occurrence.authorisation,
        occurrence,
        auditedActions: parseAuditHistory(history.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))),
        editable: isTapOccurrenceEditable(occurrence),
        authorisationEditable: isTapAuthorisationEditable(occurrence.authorisation),
      })
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
      res.notFound()
    }
  }
}
