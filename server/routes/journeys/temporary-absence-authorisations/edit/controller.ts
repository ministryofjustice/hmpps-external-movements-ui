import { Request, Response } from 'express'

export class EditTapAuthorisationController {
  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/view', {
      showBreadcrumbs: true,
      ...req.journeyData.updateTapAuthorisation!.authorisation,
    })
  }
}
