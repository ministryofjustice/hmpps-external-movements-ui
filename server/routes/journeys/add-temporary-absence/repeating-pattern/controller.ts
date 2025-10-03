import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'

export class RepeatingPatternController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/repeating-pattern/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'start-end-dates'),
      patternType: res.locals['formResponses']?.['patternType'] ?? req.journeyData.addTemporaryAbsence!.patternType,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { patternType: req.body.patternType }))
  }
}
