import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import {
  absenceCategorisationMapper,
  getCategoryFromJourney,
  saveCategorySubJourney,
  updateCategorySubJourney,
} from '../../../common/utils'

export class AbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { absenceType } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    res.render('add-temporary-absence/absence-type/view', {
      backUrl: `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails!.prisonerNumber}`,
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(absenceCategorisationMapper),
      absenceType: res.locals['formResponses']?.['absenceType'] ?? absenceType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    updateCategorySubJourney(req, 'ABSENCE_TYPE', req.body.absenceType)

    if (!req.body.absenceType.nextDomain) {
      saveCategorySubJourney(req)
      return res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'single-or-repeating')
    }

    switch (req.body.absenceType.nextDomain) {
      case 'ABSENCE_SUB_TYPE':
        return res.redirect('absence-subtype')
      case 'ABSENCE_REASON_CATEGORY':
        return res.redirect('reason-category')
      case 'ABSENCE_REASON':
        return res.redirect('reason')
      default:
        throw new Error(`Unrecognised absence categorisation domain: ${req.body.absenceType.nextDomain}`)
    }
  }
}
