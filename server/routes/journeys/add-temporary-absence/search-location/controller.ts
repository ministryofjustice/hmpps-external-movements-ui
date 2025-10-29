import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { SchemaType } from './schema'

export class SearchLocationController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/search-location/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'end-date'),
      inputValue:
        res.locals.formResponses?.['address-autosuggest-input'] ??
        req.journeyData.addTemporaryAbsence!.location?.description,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        location: {
          id: req.body.uprn && req.body.address?.addressString === req.body.addressText ? req.body.uprn : null,
          description: req.body.addressText ?? null,
        },
      }),
    )
  }
}
