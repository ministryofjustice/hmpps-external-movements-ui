import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class EndDateController {
  GET = async (req: Request, res: Response) => {
    const returnDate =
      res.locals['formResponses']?.['returnDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.returnDate)

    const returnTime = (req.journeyData.addTemporaryAbsence!.returnTime ?? '').split(':')

    const returnTimeHour = res.locals['formResponses']?.['returnTimeHour'] ?? returnTime[0]
    const returnTimeMinute = res.locals['formResponses']?.['returnTimeMinute'] ?? returnTime[1]

    res.render('add-temporary-absence/end-date/view', {
      backUrl: 'start-date',
      startDate:
        req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startDate ??
        req.journeyData.addTemporaryAbsence!.startDate,
      returnDate,
      returnTimeHour,
      returnTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney) {
      req.journeyData.addTemporaryAbsence!.startDate =
        req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney.startDate
      req.journeyData.addTemporaryAbsence!.startTime =
        req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney.startTime

      delete req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney
    }
    req.journeyData.addTemporaryAbsence!.returnDate = req.body.returnDate
    req.journeyData.addTemporaryAbsence!.returnTime = `${req.body.returnTimeHour}:${req.body.returnTimeMinute}`

    res.redirect('location-type')
  }
}
