import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'

export class AbsenceCommentsController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/comments/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'transport'),
      notes: res.locals['formResponses']?.['notes'] ?? req.journeyData.addTemporaryAbsence!.notes,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { notes: req.body.notes }))
  }
}
