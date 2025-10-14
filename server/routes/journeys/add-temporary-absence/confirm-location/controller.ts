import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'

export class ConfirmLocationController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/confirm-location/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'search-location'),
      address:
        req.journeyData.addTemporaryAbsence!.confirmLocationSubJourney!.location ??
        req.journeyData.addTemporaryAbsence!.location,
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        confirmLocationSubJourney: {
          location: (req.journeyData.addTemporaryAbsence!.confirmLocationSubJourney?.location ??
            req.journeyData.addTemporaryAbsence!.location)!,
        },
      }),
    )
  }
}
