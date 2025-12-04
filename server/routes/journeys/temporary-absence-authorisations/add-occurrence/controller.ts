import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class AddOccurrenceController {
  GET = async (req: Request, res: Response) => {
    const { backUrl, authorisation, ...occurrence } = req.journeyData.addTapOccurrence!

    const startDate = res.locals.formResponses?.['startDate'] ?? formatInputDate(occurrence.startDate)
    const startTime = (occurrence.startTime ?? '').split(':')
    const startTimeHour = res.locals.formResponses?.['startTimeHour'] ?? startTime[0]
    const startTimeMinute = res.locals.formResponses?.['startTimeMinute'] ?? startTime[1]

    const returnDate = res.locals.formResponses?.['returnDate'] ?? formatInputDate(occurrence.returnDate)
    const returnTime = (occurrence.returnTime ?? '').split(':')
    const returnTimeHour = res.locals.formResponses?.['returnTimeHour'] ?? returnTime[0]
    const returnTimeMinute = res.locals.formResponses?.['returnTimeMinute'] ?? returnTime[1]

    res.render('temporary-absence-authorisations/add-occurrence/view', {
      backUrl,
      startDate,
      startTimeHour,
      startTimeMinute,
      returnDate,
      returnTimeHour,
      returnTimeMinute,
      fromDate: authorisation.fromDate,
      toDate: authorisation.toDate,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.addTapOccurrence!
    journey.startDate = req.body.startDate
    journey.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    journey.returnDate = req.body.returnDate
    journey.returnTime = `${req.body.returnTimeHour}:${req.body.returnTimeMinute}`
    res.redirect('add-occurrence/search-location')
  }
}
