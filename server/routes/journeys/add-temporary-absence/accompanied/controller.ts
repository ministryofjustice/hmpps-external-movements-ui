import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

export class AccompaniedController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const accompaniedBy =
      res.locals['formResponses']?.['accompaniedBy'] ||
      req.journeyData.addTemporaryAbsence?.accompaniedSubJourney?.accompaniedBy ||
      req.journeyData.addTemporaryAbsence?.accompaniedBy

    res.render('add-temporary-absence/accompanied/view', {
      accompaniedByOptions: await this.externalMovementsService.getReferenceData({ res }, 'accompanied-by'),
      accompaniedBy: accompaniedBy?.code,
      backUrl: 'accompanied-or-unaccompanied',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.accompaniedSubJourney!.accompaniedBy = req.body.accompaniedBy
    res.redirect('transport')
  }
}
