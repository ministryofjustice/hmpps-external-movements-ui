import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class EditTapAuthorisationAccompaniedOrUnaccompaniedController {
  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/accompanied-or-unaccompanied/view', {
      backUrl: req.journeyData.updateTapAuthorisation!.backUrl,
      accompanied:
        req.journeyData.updateTapAuthorisation!.accompanied ??
        req.journeyData.updateTapAuthorisation!.authorisation.accompaniedBy.code !== 'U',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.accompanied = req.body.accompanied
    res.redirect(req.body.accompanied ? 'accompanied' : 'change-confirmation')
  }
}
