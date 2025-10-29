import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'

export class AbsenceApprovalController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/approval/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'comments'),
      requireApproval:
        res.locals.formResponses?.['requireApproval'] ?? req.journeyData.addTemporaryAbsence!.requireApproval,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { requireApproval: req.body.requireApproval }))
  }
}
