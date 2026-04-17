import { Request, Response } from 'express'
import { EnterLocationSchemaType } from '../../../add-temporary-absence/enter-location/schema'

export class EditTapAuthorisationEnterLocationController {
  GET = async (req: Request, res: Response) => {
    const { location } = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/enter-location/view', {
      backUrl: 'search-location',
      description: res.locals.formResponses?.['description'] ?? location?.description,
      line1: res.locals.formResponses?.['line1'] ?? location?.line1,
      line2: res.locals.formResponses?.['line2'] ?? location?.line2,
      city: res.locals.formResponses?.['city'] ?? location?.city,
      county: res.locals.formResponses?.['county'] ?? location?.county,
      postcode: res.locals.formResponses?.['postcode'] ?? location?.postcode,
    })
  }

  POST = async (req: Request<unknown, unknown, EnterLocationSchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.location = req.body
    res.redirect('change-confirmation')
  }
}
