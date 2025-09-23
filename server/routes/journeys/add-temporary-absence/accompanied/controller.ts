import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { AddTapFlowControl } from '../flow'

export class AccompaniedController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const accompaniedBy =
      res.locals['formResponses']?.['accompaniedBy'] || req.journeyData.addTemporaryAbsence?.accompaniedBy

    res.render('add-temporary-absence/accompanied/view', {
      accompaniedByOptions: await this.externalMovementsService.getReferenceData({ res }, 'accompanied-by'),
      accompaniedBy: accompaniedBy?.code,
      backUrl: AddTapFlowControl.getBackUrl(req, 'accompanied-or-unaccompanied'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { accompaniedBy: req.body.accompaniedBy }))
  }
}
