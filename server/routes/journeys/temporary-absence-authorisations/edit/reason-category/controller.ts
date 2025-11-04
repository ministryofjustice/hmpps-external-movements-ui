import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { getUrlForNextDomain } from '../../../add-temporary-absence/flow'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'
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
    req.journeyData.updateTapAuthorisation!.reasonCategory = req.body.reasonCategory
    if (req.body.reasonCategory.nextDomain) {
      res.redirect(getUrlForNextDomain(req.body.reasonCategory.nextDomain))
    } else {
      // TODO: send API call to apply change
      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        `You’ve updated the temporary absence categorisation for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
      )
      res.redirect(`/temporary-absence-authorisations/${req.journeyData.updateTapAuthorisation!.authorisation.id}`)
    }
  }
}
