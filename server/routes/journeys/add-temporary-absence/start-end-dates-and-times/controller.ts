import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { AddTapFlowControl } from '../flow'

export class StartEndDateTimeController {
  GET = async (req: Request, res: Response) => {
    const startDate =
      res.locals.formResponses?.['startDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.startDate)

    const startTime = (req.journeyData.addTemporaryAbsence!.startTime ?? '').split(':')

    const startTimeHour = res.locals.formResponses?.['startTimeHour'] ?? startTime[0]
    const startTimeMinute = res.locals.formResponses?.['startTimeMinute'] ?? startTime[1]

    const returnDate =
      res.locals.formResponses?.['returnDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.returnDate)

    const returnTime = (req.journeyData.addTemporaryAbsence!.returnTime ?? '').split(':')

    const returnTimeHour = res.locals.formResponses?.['returnTimeHour'] ?? returnTime[0]
    const returnTimeMinute = res.locals.formResponses?.['returnTimeMinute'] ?? returnTime[1]

    res.render('add-temporary-absence/start-end-dates-and-times/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'single-or-repeating'),
      startDate,
      startTimeHour,
      startTimeMinute,
      returnDate,
      returnTimeHour,
      returnTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        startDate: req.body.startDate,
        startTime: `${req.body.startTimeHour}:${req.body.startTimeMinute}`,
        returnDate: req.body.returnDate,
        returnTime: `${req.body.returnTimeHour}:${req.body.returnTimeMinute}`,
      }),
    )
  }
}
