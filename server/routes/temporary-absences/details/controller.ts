import { Request, Response } from 'express'
import { HTTPError } from 'superagent'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { getApiUserErrorMessage, isTapAuthorisationEditable, isTapOccurrenceEditable } from '../../../utils/utils'
import { parseAuditHistory } from '../../../utils/parseAuditHistory'

export class TapOccurrenceDetailsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const [occurrence, history] = await Promise.all([
        this.externalMovementsService.getTapOccurrence({ res }, req.params.id),
        this.externalMovementsService.getTapOccurrenceHistory({ res }, req.params.id),
      ])

      res.locals.prisonerDetails = {
        prisonerNumber: occurrence.authorisation.person.personIdentifier,
        lastName: occurrence.authorisation.person.lastName,
        firstName: occurrence.authorisation.person.firstName,
        dateOfBirth: occurrence.authorisation.person.dateOfBirth,
        prisonName: res.locals.user.activeCaseLoad?.description,
        cellLocation: occurrence.authorisation.person.cellLocation,
      }

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
