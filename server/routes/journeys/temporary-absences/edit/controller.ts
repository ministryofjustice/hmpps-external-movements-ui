import { Request, Response } from 'express'

export class EditTapOccurrenceController {
  GET = async (req: Request, res: Response) => {
    delete req.journeyData.updateTapOccurrence!.changeType
    res.render('temporary-absences/edit/view', {
      showBreadcrumbs: true,
      result: req.journeyData.updateTapOccurrence!.occurrence,
    })
  }
}
