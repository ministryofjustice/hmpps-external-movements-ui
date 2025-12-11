import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditOccurrenceStartEndDatesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, occurrence, authorisation } = req.journeyData.updateTapOccurrence!

    const startDate = res.locals.formResponses?.['startDate'] ?? format(occurrence.start, 'd/M/yyyy')
    const startTimeHour = res.locals.formResponses?.['startTimeHour'] ?? format(occurrence.start, 'HH')
    const startTimeMinute = res.locals.formResponses?.['startTimeMinute'] ?? format(occurrence.start, 'mm')

    const returnDate = res.locals.formResponses?.['returnDate'] ?? format(occurrence.end, 'd/M/yyyy')
    const returnTimeHour = res.locals.formResponses?.['returnTimeHour'] ?? format(occurrence.end, 'HH')
    const returnTimeMinute = res.locals.formResponses?.['returnTimeMinute'] ?? format(occurrence.end, 'mm')

    res.render('temporary-absences/edit/start-end-dates/view', {
      backUrl,
      startDate,
      startTimeHour,
      startTimeMinute,
      returnDate,
      returnTimeHour,
      returnTimeMinute,
      repeat: authorisation.repeat,
      start: authorisation.start,
      end: authorisation.end,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!
    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'RescheduleOccurrence',
        start: `${req.body.startDate}T${req.body.startTimeHour}:${req.body.startTimeMinute}:00`,
        end: `${req.body.returnDate}T${req.body.returnTimeHour}:${req.body.returnTimeMinute}:00`,
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
