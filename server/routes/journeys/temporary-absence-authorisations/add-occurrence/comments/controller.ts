import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { JourneyData } from '../../../../../@types/journeys'

export class AddTapOccurrenceCommentsController {
  GET = async (req: Request, res: Response) => {
    const { authorisation, notes } = req.journeyData.addTapOccurrence!

    res.render('temporary-absence-authorisations/add-occurrence/comments/view', {
      backUrl: this.getBackUrl(req.journeyData),
      notes: res.locals.formResponses?.['notes'] ?? (notes !== undefined ? notes : authorisation.notes),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.notes = req.body.notes

    res.redirect('check-answers')
  }

  private getBackUrl = (journey: JourneyData) => {
    if (journey.isCheckAnswers) return 'check-answers'
    return journey.addTapOccurrence!.locationOption === 'NEW' ? 'search-location' : 'select-location'
  }
}
