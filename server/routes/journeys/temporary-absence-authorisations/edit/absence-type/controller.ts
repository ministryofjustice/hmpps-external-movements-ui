import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../../common/utils'
import { getUrlForNextDomain } from '../../../add-temporary-absence/flow'
import { getUpdateAbsenceCategoryRequest } from '../utils'

export class EditAbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/absence-type/view', {
      backUrl: req.journeyData.updateTapAuthorisation!.backUrl,
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(absenceCategorisationMapper),
      absenceType:
        res.locals.formResponses?.['absenceType'] ??
        req.journeyData.updateTapAuthorisation!.absenceType?.code ??
        req.journeyData.updateTapAuthorisation!.authorisation.absenceType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

    if (journey.absenceType !== req.body.absenceType) {
      delete journey.absenceSubType
      delete journey.reasonCategory
      delete journey.reason
    }
    journey.absenceType = req.body.absenceType

    if (req.body.absenceType.nextDomain) {
      res.redirect(getUrlForNextDomain(req.body.absenceType.nextDomain))
      return
    }

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
