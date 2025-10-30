import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { AddTapFlowControl } from '../flow'

export class StartEndDatesController {
  GET = async (req: Request, res: Response) => {
    const fromDate =
      res.locals.formResponses?.['fromDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.fromDate)

    const toDate = res.locals.formResponses?.['toDate'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.toDate)

    res.render('add-temporary-absence/start-end-dates/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'single-or-repeating'),
      fromDate,
      toDate,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
      }),
    )
  }
}
