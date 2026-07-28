import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { JourneyData } from '../../../../../@types/journeys'

export class AddTapOccurrenceCommentsController {
  GET = async (req: Request, res: Response) => {
    const { authorisation, comments } = req.journeyData.addTapOccurrence!

    res.render('temporary-absence-authorisations/add-occurrence/comments/view', {
      backUrl: this.getBackUrl(req.journeyData),
      comments: res.locals.formResponses?.['comments'] ?? (comments !== undefined ? comments : authorisation.comments),
      prepopulated: !!authorisation.comments?.trim().length,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.comments = req.body.comments

    res.redirect('check-answers')
  }

  private getBackUrl = (journey: JourneyData) => {
    const { locationOption, location } = journey.addTapOccurrence!
    if (journey.isCheckAnswers) return 'check-answers'
    if (locationOption === 'NEW') {
      if (location?.type === 'SAVED_LOCATION') {
        return 'location#select-location'
      }
      if (location?.type === 'SEARCHED_ADDRESS') {
        return 'location#search-address'
      }
      if (location?.type === 'ENTERED_ADDRESS') {
        return 'location#enter-address'
      }
      if (location?.type === 'ENTERED_AREA') {
        return 'location#enter-area'
      }

      return 'location'
    }
    return 'select-location'
  }
}
