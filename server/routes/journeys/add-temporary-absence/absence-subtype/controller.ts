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
      absenceSubType: res.locals.formResponses?.['absenceSubType'] ?? absenceSubType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { absenceSubType: req.body.absenceSubType }))
  }
}
