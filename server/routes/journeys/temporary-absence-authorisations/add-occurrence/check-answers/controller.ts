import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class AddTapOccurrenceCheckAnswersController {
  // @ts-expect-error service not yet in use
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { authorisation, ...occurrence } = req.journeyData.addTapOccurrence!

    req.journeyData.isCheckAnswers = true

    res.render('temporary-absence-authorisations/add-occurrence/check-answers/view', {
      backUrl: 'comments',
      authorisation,
      occurrence,
    })
  }

  submitToApi = async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      // TODO: add API call
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => res.redirect('confirmation')
}
