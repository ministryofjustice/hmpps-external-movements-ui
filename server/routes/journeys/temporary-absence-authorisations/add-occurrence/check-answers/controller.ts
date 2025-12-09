import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { components } from '../../../../../@types/externalMovements'
import { parseAddress } from '../../../../../utils/utils'

export class AddTapOccurrenceCheckAnswersController {
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

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journey = req.journeyData.addTapOccurrence!

      const request: components['schemas']['CreateOccurrenceRequest'] = {
        releaseAt: `${journey.startDate}T${journey.startTime}:00`,
        returnBy: `${journey.returnDate}T${journey.returnTime}:00`,
        location:
          journey.locationOption === 'NEW'
            ? parseAddress(journey.location!)
            : journey.authorisation.locations[journey.locationOption!]!,
      }

      if (journey.notes) request.notes = journey.notes

      journey.result = await this.externalMovementsService.addTapOccurrence({ res }, journey.authorisation.id, request)
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => res.redirect('confirmation')
}
