import { Request, Response } from 'express'

export class EditTapAuthorisationConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/confirmation/view', {
      domainEvent: req.journeyData.updateTapAuthorisation!.result!.content[0]!.domainEvents[0],
      authorisation: req.journeyData.updateTapAuthorisation!.authorisation,
    })
  }
}
