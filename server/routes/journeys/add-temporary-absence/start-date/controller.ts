import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class StartDateController {
  GET = async (req: Request, res: Response) => {
    const startDate =
      res.locals['formResponses']?.['startDate'] ??
      formatInputDate(
        req.journeyData.addTemporaryAbsence!.startDate ??
          req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startDate,
      )

    const startTime = (
      req.journeyData.addTemporaryAbsence!.startTime ??
      req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startTime ??
      ''
    ).split(':')

    const startTimeHour = res.locals['formResponses']?.['startTimeHour'] ?? startTime[0]
    const startTimeMinute = res.locals['formResponses']?.['startTimeMinute'] ?? startTime[1]

    res.render('add-temporary-absence/start-date/view', {
      backUrl: 'single-or-repeating',
      startDate,
      startTimeHour,
      startTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney = {
      startDate: req.body.startDate,
      startTime: `${req.body.startTimeHour}:${req.body.startTimeMinute}`,
    }
    res.redirect('end-date')
  }
}
