import { Request, Response } from 'express'

export class AddAbsenceConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true
    res.render('add-temporary-absence/confirmation/view', {})
  }
}
