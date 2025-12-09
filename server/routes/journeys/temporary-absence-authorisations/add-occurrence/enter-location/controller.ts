import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class AddTapOccurrenceEnterLocationController {
  GET = async (req: Request, res: Response) => {
    let { location } = req.journeyData.addTapOccurrence!
    if (location?.id) location = undefined

    res.render('temporary-absence-authorisations/add-occurrence/enter-location/view', {
      backUrl: 'search-location',
      description: res.locals.formResponses?.['description'] ?? location?.description,
      line1: res.locals.formResponses?.['line1'] ?? location?.line1,
      line2: res.locals.formResponses?.['line2'] ?? location?.line2,
      city: res.locals.formResponses?.['city'] ?? location?.city,
      county: res.locals.formResponses?.['county'] ?? location?.county,
      postcode: res.locals.formResponses?.['postcode'] ?? location?.postcode,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.location = req.body
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'comments')
  }
}
