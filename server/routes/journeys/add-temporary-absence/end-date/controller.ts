import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class EndDateController {
  GET = async (req: Request, res: Response) => {
    const endDate =
      res.locals['formResponses']?.['endDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.endDate)

    const endTime = (req.journeyData.addTemporaryAbsence!.endTime ?? '').split(':')

    const endTimeHour = res.locals['formResponses']?.['endTimeHour'] ?? endTime[0]
    const endTimeMinute = res.locals['formResponses']?.['endTimeMinute'] ?? endTime[1]

    res.render('add-temporary-absence/end-date/view', {
      backUrl: 'start-date',
      startDate:
        req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startDate ??
        req.journeyData.addTemporaryAbsence!.startDate,
      endDate,
      endTimeHour,
      endTimeMinute,
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
    req.journeyData.addTemporaryAbsence!.endDate = req.body.endDate
    req.journeyData.addTemporaryAbsence!.endTime = `${req.body.endTimeHour}:${req.body.endTimeMinute}`

    res.redirect('location-type')
  }
}
