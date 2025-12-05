import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { SchemaType } from './schema'
import { Address } from '../../../../@types/journeys'

export class SearchLocationController {
  GET = async (req: Request, res: Response) => {
    const { location } = req.journeyData.addTemporaryAbsence!

    res.render('add-temporary-absence/search-location/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'end-date'),
      uprn: location?.id ? String(location?.id) : null,
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.description,
      line1: res.locals.formResponses?.['line1'] ?? location?.line1,
      line2: res.locals.formResponses?.['line2'] ?? location?.line2,
      city: res.locals.formResponses?.['city'] ?? location?.city,
      county: res.locals.formResponses?.['county'] ?? location?.county,
      postcode: res.locals.formResponses?.['postcode'] ?? location?.postcode,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const address: Address = req.body.isManual
      ? {
          id: null,
          ...req.body,
        }
      : {
          id: Number(req.body.uprn!),
          description: req.body.addressString ?? null,
        }

    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        location: address,
      }),
    )
  }
}
