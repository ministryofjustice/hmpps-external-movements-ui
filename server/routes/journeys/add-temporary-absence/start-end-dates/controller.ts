import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { AddTapFlowControl } from '../flow'

export class StartEndDatesController {
  GET = async (req: Request, res: Response) => {
    const start = res.locals.formResponses?.['start'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.start)

    const end = res.locals.formResponses?.['end'] ?? formatInputDate(req.journeyData.addTemporaryAbsence!.end)

    res.render('add-temporary-absence/start-end-dates/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'single-or-repeating'),
      start,
      end,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        start: req.body.start,
        end: req.body.end,
      }),
    )
  }
}
