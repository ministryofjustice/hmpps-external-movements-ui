import { Request, Response } from 'express'

export class AddTapOccurrenceConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true
    res.render('temporary-absence-authorisations/add-occurrence/confirmation/view', {
      authorisation: req.journeyData.addTapOccurrence!.authorisation,
      occurrenceId: req.journeyData.addTapOccurrence!.result!.id,
    })
  }
}
