import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class TapReviewController {
  GET = async (req: Request, res: Response) => {
    const { backUrl, authorisation, approve } = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/review/view', {
      backUrl,
      authorisation,
      approve,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.approve = req.body.approve
    res.redirect('review-reason')
  }
}
