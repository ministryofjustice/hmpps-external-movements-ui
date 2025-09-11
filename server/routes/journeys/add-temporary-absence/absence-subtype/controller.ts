import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import {
  absenceCategorisationMapper,
  getAbsenceCategorisationsForDomain,
  getAbsenceCategoryBackUrl,
  getCategoryFromJourney,
  saveCategorySubJourney,
  updateCategorySubJourney,
} from '../../../common/utils'

export class AbsenceSubTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { absenceType, absenceSubType } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    res.render('add-temporary-absence/absence-subtype/view', {
      backUrl: getAbsenceCategoryBackUrl(req, 'ABSENCE_SUB_TYPE'),
      options: (
        await getAbsenceCategorisationsForDomain(this.externalMovementsService, req, res, 'ABSENCE_SUB_TYPE')
      ).items.map(absenceCategorisationMapper),
      absenceType,
      absenceSubType: res.locals['formResponses']?.['absenceSubType'] ?? absenceSubType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    updateCategorySubJourney(req, 'ABSENCE_SUB_TYPE', req.body.absenceSubType)

    if (!req.body.absenceSubType.nextDomain) {
      saveCategorySubJourney(req)
      return res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'single-or-repeating')
    }

    switch (req.body.absenceSubType.nextDomain) {
      case 'ABSENCE_REASON_CATEGORY':
        return res.redirect('reason-category')
      case 'ABSENCE_REASON':
        return res.redirect('reason')
      default:
        throw new Error(`Unrecognised absence categorisation domain: ${req.body.absenceSubType.nextDomain}`)
    }
  }
}
