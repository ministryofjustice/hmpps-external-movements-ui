import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper, getCategoryFromJourney } from '../../../common/utils'
import { AddTapFlowControl } from '../flow'
import { Page } from '../../../../services/auditService'

export class AbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { absenceType } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    const lastLandmark = res.locals.breadcrumbs.last()

    res.render('add-temporary-absence/absence-type/view', {
      backUrl:
        lastLandmark && ['temp-page-2', 'temp-page-3', Page.SEARCH_PRISONER].includes(lastLandmark.alias || '')
          ? lastLandmark.href
          : `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails!.prisonerNumber}`,
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(absenceCategorisationMapper),
      absenceType: res.locals.formResponses?.['absenceType'] ?? absenceType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { absenceType: req.body.absenceType }))
  }
}
