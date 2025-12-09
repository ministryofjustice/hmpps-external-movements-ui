import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { getUrlForNextDomain } from '../../../add-temporary-absence/flow'
import { getUpdateAbsenceCategorisationsForDomain, getUpdateAbsenceCategoryBackUrl } from '../utils'

export class EditAbsenceSubTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/absence-subtype/view', {
      backUrl: getUpdateAbsenceCategoryBackUrl(req, 'ABSENCE_SUB_TYPE'),
      options: (
        await getUpdateAbsenceCategorisationsForDomain(this.externalMovementsService, req, res, 'ABSENCE_SUB_TYPE')
      ).items.map(absenceCategorisationMapper),
      absenceType: journey.absenceType ?? journey.authorisation.absenceType,
      absenceSubType:
        res.locals.formResponses?.['absenceSubType'] ??
        journey.absenceSubType?.code ??
        journey.authorisation.absenceSubType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    if (
      (journey.authorisation.absenceType?.code === journey.absenceType?.code || !journey.absenceType) &&
      journey.authorisation.absenceSubType?.code === req.body.absenceSubType.code
    ) {
      res.redirect(`/temporary-absence-authorisations/${journey.authorisation.id}`)
      return
    }

    if (journey.absenceSubType !== req.body.absenceSubType) {
      delete journey.reasonCategory
      delete journey.reason
    }
    journey.absenceSubType = req.body.absenceSubType

    if (req.body.absenceSubType.nextDomain) {
      res.redirect(getUrlForNextDomain(req.body.absenceSubType.nextDomain))
      return
    }

    res.redirect('change-confirmation')
  }
}
