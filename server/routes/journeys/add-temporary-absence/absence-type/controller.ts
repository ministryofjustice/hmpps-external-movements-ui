import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper, getCategoryFromJourney } from '../../../common/utils'
import { AddTapFlowControl } from '../flow'

export class AbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { absenceType } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

    const entryPath = res.locals.history?.slice(-4)[0]

    res.render('add-temporary-absence/absence-type/view', {
      backUrl:
        entryPath?.startsWith('/temporary-absence') || entryPath?.startsWith('/search-prisoner')
          ? entryPath
          : `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails!.prisonerNumber}`,
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(absenceCategorisationMapper),
      absenceType: res.locals.formResponses?.['absenceType'] ?? absenceType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { absenceType: req.body.absenceType }))
  }
}
