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

export class AbsenceReasonController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { reasonCategory, reason } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    res.render('add-temporary-absence/reason/view', {
      backUrl: getAbsenceCategoryBackUrl(req, 'ABSENCE_REASON'),
      options: (
        await getAbsenceCategorisationsForDomain(this.externalMovementsService, req, res, 'ABSENCE_REASON')
      ).items.map(absenceCategorisationMapper),
      reasonCategory,
      reason: res.locals['formResponses']?.['reason'] ?? reason?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    updateCategorySubJourney(req, 'ABSENCE_REASON', req.body.reason)
    saveCategorySubJourney(req)

    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'single-or-repeating')
  }
}
