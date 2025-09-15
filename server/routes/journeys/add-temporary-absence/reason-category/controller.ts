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

export class ReasonCategoryController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { reasonCategory } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    res.render('add-temporary-absence/reason-category/view', {
      backUrl: getAbsenceCategoryBackUrl(req, 'ABSENCE_REASON_CATEGORY'),
      options: (
        await getAbsenceCategorisationsForDomain(this.externalMovementsService, req, res, 'ABSENCE_REASON_CATEGORY')
      ).items.map(absenceCategorisationMapper),
      reasonCategory: res.locals['formResponses']?.['reasonCategory'] ?? reasonCategory?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    updateCategorySubJourney(req, 'ABSENCE_REASON_CATEGORY', req.body.reasonCategory)

    if (!req.body.reasonCategory.nextDomain) {
      saveCategorySubJourney(req)
      return res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'single-or-repeating')
    }

    switch (req.body.reasonCategory.nextDomain) {
      case 'ABSENCE_REASON':
        return res.redirect('reason')
      default:
        throw new Error(`Unrecognised absence categorisation domain: ${req.body.reasonCategory.nextDomain}`)
    }
  }
}
