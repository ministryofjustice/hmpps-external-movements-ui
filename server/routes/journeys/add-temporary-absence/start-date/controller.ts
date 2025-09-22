import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { AddTapFlowControl } from '../flow'

export class StartDateController {
  GET = async (req: Request, res: Response) => {
    const startDate =
      res.locals['formResponses']?.['startDate'] ??
      formatInputDate(
        req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startDate ??
          req.journeyData.addTemporaryAbsence!.startDate,
      )

    const startTime = (
      req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startTime ??
      req.journeyData.addTemporaryAbsence!.startTime ??
      ''
    ).split(':')

    const startTimeHour = res.locals['formResponses']?.['startTimeHour'] ?? startTime[0]
    const startTimeMinute = res.locals['formResponses']?.['startTimeMinute'] ?? startTime[1]

    res.render('add-temporary-absence/start-date/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'single-or-repeating'),
      startDate,
      startTimeHour,
      startTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        startDate: req.body.startDate,
        startTime: `${req.body.startTimeHour}:${req.body.startTimeMinute}`,
      }),
    )
  }
}
