import { Request, Response } from 'express'

export class EditTapOccurrenceConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { authorisation, occurrence, result } = req.journeyData.updateTapOccurrence!

    res.render('temporary-absences/edit/confirmation/view', {
      domainEvent: result!.content[0]!.domainEvents[0],
      authorisation,
      occurrence,
    })
  }
}
