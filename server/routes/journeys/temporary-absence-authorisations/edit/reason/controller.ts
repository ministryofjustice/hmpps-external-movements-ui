import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import {
  getUpdateAbsenceCategorisationsForDomain,
  getUpdateAbsenceCategoryBackUrl,
  getUpdateAbsenceCategoryRequest,
} from '../utils'

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

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!
    journey.reason = req.body.reason

    try {
      journey.result = await this.externalMovementsService.updateTapAuthorisation(
        { res },
        journey.authorisation.id,
        getUpdateAbsenceCategoryRequest(req),
      )
      res.redirect(
        journey.result!.content.length
          ? 'confirmation'
          : `/temporary-absence-authorisations/${journey.authorisation.id}`,
      )
    } catch (e) {
      next(e)
    }
  }
}
