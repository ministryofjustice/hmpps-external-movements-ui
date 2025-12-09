import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { getUpdateAbsenceCategorisationsForDomain, getUpdateAbsenceCategoryBackUrl } from '../utils'

export class EditAbsenceReasonController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { absenceType, absenceSubType, reasonCategory, reason, authorisation } =
      req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/reason/view', {
      backUrl: getUpdateAbsenceCategoryBackUrl(req, 'ABSENCE_REASON'),
      options: (
        await getUpdateAbsenceCategorisationsForDomain(this.externalMovementsService, req, res, 'ABSENCE_REASON')
      ).items.map(absenceCategorisationMapper),
      reasonCategory:
        absenceType || absenceSubType || reasonCategory ? reasonCategory : authorisation.absenceReasonCategory,
      reason: res.locals.formResponses?.['reason'] ?? reason?.code ?? authorisation.absenceReason?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!
    journey.reason = req.body.reason

    if (
      (journey.authorisation.absenceType?.code === journey.absenceType?.code || !journey.absenceType) &&
      (journey.authorisation.absenceSubType?.code === journey.absenceSubType?.code || !journey.absenceSubType) &&
      (journey.authorisation.absenceReasonCategory?.code === journey.reasonCategory?.code || !journey.reasonCategory) &&
      journey.authorisation.absenceReason?.code === req.body.reason.code
    ) {
      res.redirect(`/temporary-absence-authorisations/${journey.authorisation.id}`)
      return
    }

    res.redirect('change-confirmation')
  }
}
