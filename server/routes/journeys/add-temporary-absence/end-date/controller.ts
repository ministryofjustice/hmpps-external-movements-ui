import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { AddTapFlowControl } from '../flow'

export class EndDateController {
  GET = async (req: Request, res: Response) => {
    const returnDate =
      res.locals.formResponses?.['returnDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.returnDate)

    const returnTime = (req.journeyData.addTemporaryAbsence!.returnTime ?? '').split(':')

    const returnTimeHour = res.locals.formResponses?.['returnTimeHour'] ?? returnTime[0]
    const returnTimeMinute = res.locals.formResponses?.['returnTimeMinute'] ?? returnTime[1]

    res.render('add-temporary-absence/end-date/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'start-date'),
      startDate:
        req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startDate ??
        req.journeyData.addTemporaryAbsence!.startDate,
      returnDate,
      returnTimeHour,
      returnTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        returnDate: req.body.returnDate,
        returnTime: `${req.body.returnTimeHour}:${req.body.returnTimeMinute}`,
      }),
    )
  }
}
