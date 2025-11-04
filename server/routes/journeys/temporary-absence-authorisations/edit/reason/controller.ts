import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'
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
      reasonCategory: absenceType || absenceSubType || reasonCategory ? reasonCategory : authorisation,
      reason: res.locals.formResponses?.['reason'] ?? reason?.code ?? authorisation.absenceReason?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    // TODO: send API call to apply change
    req.flash(
      FLASH_KEY__SUCCESS_BANNER,
      `You’ve updated the temporary absence categorisation for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
    )
    res.redirect(`/temporary-absence-authorisations/${req.journeyData.updateTapAuthorisation!.authorisation.id}`)
  }
}
