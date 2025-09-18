import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

export class AddTapCheckAnswersController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.addTemporaryAbsence!.categorySubJourney
    delete req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney
    delete req.journeyData.addTemporaryAbsence!.locationSubJourney
    delete req.journeyData.addTemporaryAbsence!.accompaniedSubJourney

    res.render('add-temporary-absence/check-answers/view', {
      backUrl: 'approval',
      ...req.journeyData.addTemporaryAbsence!,
    })
  }
}
