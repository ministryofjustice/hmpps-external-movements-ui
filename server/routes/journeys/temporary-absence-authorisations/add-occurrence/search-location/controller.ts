import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class AddTapOccurrenceSearchLocationController {
  GET = async (req: Request, res: Response) => {
    const { location } = req.journeyData.addTapOccurrence!

    res.render('temporary-absence-authorisations/add-occurrence/search-location/view', {
      backUrl: 'select-location',
      uprn: location?.id ? String(location?.id) : null,
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.address,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.location = {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
    }

    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'comments')
  }
}
