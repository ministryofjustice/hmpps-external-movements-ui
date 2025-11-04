import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { getUrlForNextDomain } from '../../../add-temporary-absence/flow'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'

export class EditAbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/absence-type/view', {
      backUrl: '../edit',
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(absenceCategorisationMapper),
      absenceType:
        res.locals.formResponses?.['absenceType'] ??
        req.journeyData.updateTapAuthorisation!.absenceType?.code ??
        req.journeyData.updateTapAuthorisation!.authorisation.absenceType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.absenceType = req.body.absenceType
    if (req.body.absenceType.nextDomain) {
      res.redirect(getUrlForNextDomain(req.body.absenceType.nextDomain))
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
