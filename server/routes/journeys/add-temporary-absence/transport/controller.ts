import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { AddTapFlowControl } from '../flow'

export class TransportController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/transport/view', {
      options: await this.externalMovementsService.getReferenceData({ res }, 'transport'),
      backUrl: AddTapFlowControl.getBackUrl(
        req,
        req.journeyData.addTemporaryAbsence!.accompanied ? 'accompanied' : 'accompanied-or-unaccompanied',
      ),
      transport: res.locals.formResponses?.['transport'] ?? req.journeyData.addTemporaryAbsence!.transport?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { transport: req.body.transport }))
  }
}
