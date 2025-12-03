import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditOccurrenceStartEndDatesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, occurrence, authorisation } = req.journeyData.updateTapOccurrence!

    const startDate = res.locals.formResponses?.['startDate'] ?? format(occurrence.releaseAt, 'd/M/yyyy')
    const startTimeHour = res.locals.formResponses?.['startTimeHour'] ?? format(occurrence.releaseAt, 'HH')
    const startTimeMinute = res.locals.formResponses?.['startTimeMinute'] ?? format(occurrence.releaseAt, 'mm')

    const returnDate = res.locals.formResponses?.['returnDate'] ?? format(occurrence.returnBy, 'd/M/yyyy')
    const returnTimeHour = res.locals.formResponses?.['returnTimeHour'] ?? format(occurrence.returnBy, 'HH')
    const returnTimeMinute = res.locals.formResponses?.['returnTimeMinute'] ?? format(occurrence.returnBy, 'mm')

    res.render('temporary-absences/edit/start-end-dates/view', {
      backUrl,
      startDate,
      startTimeHour,
      startTimeMinute,
      returnDate,
      returnTimeHour,
      returnTimeMinute,
      repeat: authorisation.repeat,
      fromDate: authorisation.fromDate,
      toDate: authorisation.toDate,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!
    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'RescheduleOccurrence',
        releaseAt: `${req.body.startDate}T${req.body.startTimeHour}:${req.body.startTimeMinute}:00`,
        returnBy: `${req.body.returnDate}T${req.body.returnTimeHour}:${req.body.returnTimeMinute}:00`,
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
