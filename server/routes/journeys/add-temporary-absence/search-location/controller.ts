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
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.address,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const address: Address = {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
    }

    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        location: address,
      }),
    )
  }
}
