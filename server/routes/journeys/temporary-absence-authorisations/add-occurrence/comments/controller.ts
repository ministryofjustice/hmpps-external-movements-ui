import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { JourneyData } from '../../../../../@types/journeys'

export class AddTapOccurrenceCommentsController {
  GET = async (req: Request, res: Response) => {
    const { authorisation, comments } = req.journeyData.addTapOccurrence!

    res.render('temporary-absence-authorisations/add-occurrence/comments/view', {
      backUrl: this.getBackUrl(req.journeyData),
      comments: res.locals.formResponses?.['comments'] ?? (comments !== undefined ? comments : authorisation.comments),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.comments = req.body.comments

    res.redirect('check-answers')
  }

  private getBackUrl = (journey: JourneyData) => {
    if (journey.isCheckAnswers) return 'check-answers'
    return journey.addTapOccurrence!.locationOption === 'NEW' ? 'search-location' : 'select-location'
  }
}
