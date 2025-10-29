import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import {
  absenceCategorisationMapper,
  getAbsenceCategorisationsForDomain,
  getAbsenceCategoryBackUrl,
  getCategoryFromJourney,
} from '../../../common/utils'
import { AddTapFlowControl } from '../flow'

export class ReasonCategoryController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { reasonCategory } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    res.render('add-temporary-absence/reason-category/view', {
      backUrl: getAbsenceCategoryBackUrl(req, 'ABSENCE_REASON_CATEGORY'),
      options: (
        await getAbsenceCategorisationsForDomain(this.externalMovementsService, req, res, 'ABSENCE_REASON_CATEGORY')
      ).items.map(absenceCategorisationMapper),
      reasonCategory: res.locals.formResponses?.['reasonCategory'] ?? reasonCategory?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { reasonCategory: req.body.reasonCategory }))
  }
}
