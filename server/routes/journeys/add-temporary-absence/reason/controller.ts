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
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { reason: req.body.reason }))
  }
}
