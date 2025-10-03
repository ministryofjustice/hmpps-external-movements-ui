import { Request, Response } from 'express'

export class AddAbsenceConfirmationController {
  GET = async (_req: Request, res: Response) => {
    res.render('add-temporary-absence/confirmation/view', {})
  }
}
