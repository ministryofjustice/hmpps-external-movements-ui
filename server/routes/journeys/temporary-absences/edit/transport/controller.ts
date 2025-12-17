import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditTransportController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absences/edit/transport/view', {
      backUrl: req.journeyData.updateTapOccurrence!.backUrl,
      options: await this.externalMovementsService.getReferenceData({ res }, 'transport'),
      transport:
        res.locals.formResponses?.['transport'] ?? req.journeyData.updateTapOccurrence!.occurrence.transport.code,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!

    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'ChangeOccurrenceTransport',
        transportCode: req.body.transport.code,
      })
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!
    res.redirect(journey.result!.content.length ? 'confirmation' : `/temporary-absences/${journey.occurrence.id}`)
  }
}
