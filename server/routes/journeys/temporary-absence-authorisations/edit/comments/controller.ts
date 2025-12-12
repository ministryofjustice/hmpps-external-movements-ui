import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class EditAbsenceCommentsController {
  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/comments/view', {
      backUrl: req.journeyData.updateTapAuthorisation!.backUrl,
      comments:
        res.locals.formResponses?.['comments'] ?? req.journeyData.updateTapAuthorisation!.authorisation.comments,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.comments = req.body.comments
    res.redirect('change-confirmation')
  }
}
