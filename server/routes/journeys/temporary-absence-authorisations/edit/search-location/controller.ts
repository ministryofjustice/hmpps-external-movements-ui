import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class EditTapAuthorisationSearchLocationController {
  GET = async (req: Request, res: Response) => {
    const { location, backUrl } = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/search-location/view', {
      backUrl,
      uprn: location?.id ? String(location?.id) : null,
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.address,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.location = {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
    }

    res.redirect('change-confirmation')
  }
}
