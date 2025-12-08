import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditAbsenceCommentsController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absences/edit/comments/view', {
      backUrl: '../edit',
      notes: res.locals.formResponses?.['notes'] ?? req.journeyData.updateTapOccurrence!.occurrence.notes,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!

    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'AmendOccurrenceNotes',
        notes: req.body.notes,
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
