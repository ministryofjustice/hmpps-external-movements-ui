import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { getUrlForNextDomain } from '../../../add-temporary-absence/flow'
import { getUpdateAbsenceCategorisationsForDomain, getUpdateAbsenceCategoryBackUrl } from '../utils'

export class EditReasonCategoryController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { reasonCategory, authorisation } = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/reason-category/view', {
      backUrl: getUpdateAbsenceCategoryBackUrl(req, 'ABSENCE_REASON_CATEGORY'),
      options: (
        await getUpdateAbsenceCategorisationsForDomain(
          this.externalMovementsService,
          req,
          res,
          'ABSENCE_REASON_CATEGORY',
        )
      ).items.map(absenceCategorisationMapper),
      reasonCategory:
        res.locals.formResponses?.['reasonCategory'] ??
        reasonCategory?.code ??
        authorisation.absenceReasonCategory?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    if (
      (journey.authorisation.absenceType?.code === journey.absenceType?.code || !journey.absenceType) &&
      (journey.authorisation.absenceSubType?.code === journey.absenceSubType?.code || !journey.absenceSubType) &&
      journey.authorisation.absenceReasonCategory?.code === req.body.reasonCategory.code
    ) {
      res.redirect(`/temporary-absence-authorisations/${journey.authorisation.id}`)
      return
    }

    if (journey.reasonCategory !== req.body.reasonCategory) {
      delete journey.reason
    }
    journey.reasonCategory = req.body.reasonCategory

    if (req.body.reasonCategory.nextDomain) {
      res.redirect(getUrlForNextDomain(req.body.reasonCategory.nextDomain))
      return
    }

    res.redirect('change-confirmation')
  }
}
