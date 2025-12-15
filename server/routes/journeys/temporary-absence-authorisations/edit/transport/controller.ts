import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditTapAuthorisationTransportController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/transport/view', {
      backUrl: req.journeyData.updateTapAuthorisation!.backUrl,
      options: await this.externalMovementsService.getReferenceData({ res }, 'transport'),
      transport:
        res.locals.formResponses?.['transport'] ||
        req.journeyData.updateTapAuthorisation?.transport?.code ||
        req.journeyData.updateTapAuthorisation?.authorisation?.transport.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.transport = req.body.transport
    res.redirect('change-confirmation')
  }
}
