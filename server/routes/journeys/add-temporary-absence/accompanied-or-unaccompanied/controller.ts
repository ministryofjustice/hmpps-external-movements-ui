import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'

export class AccompaniedOrUnaccompaniedController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/accompanied-or-unaccompanied/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'confirm-location'),
      accompanied:
        res.locals['formResponses']?.['accompanied'] ??
        req.journeyData.addTemporaryAbsence!.accompaniedSubJourney?.accompanied ??
        req.journeyData.addTemporaryAbsence!.accompanied,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { accompanied: req.body.accompanied }))
  }
}
