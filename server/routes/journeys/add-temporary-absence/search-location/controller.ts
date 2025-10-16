import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { SchemaType } from './schema'

export class SearchLocationController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/search-location/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'end-date'),
      inputValue: res.locals['formResponses']?.['address-autosuggest-input'],
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        location: {
          id: req.body.uprn,
          flat: req.body.address.subBuildingName || null,
          property: req.body.address.buildingName || null,
          street:
            req.body.address.thoroughfareName && req.body.address.buildingNumber
              ? `${req.body.address.buildingNumber} ${req.body.address.thoroughfareName}`
              : req.body.address.thoroughfareName || req.body.address.subBuildingName || null,
          area: req.body.address.dependentLocality || null,
          cityDescription: req.body.address.postTown || null,
          countyDescription: req.body.address.county || null,
          postcode: req.body.address.postcode || null,
          countryDescription: COUNTRY_DICTIONARY[req.body.address.country ?? 'E'] || 'UNKNOWN',
        },
      }),
    )
  }
}

// https://docs.os.uk/os-apis/accessing-os-apis/os-places-api/code-lists
const COUNTRY_DICTIONARY: { [key: string]: string } = {
  E: 'England',
  W: 'Wales',
  S: 'Scotland',
  N: 'Northern Ireland',
  L: 'Channel Islands',
  I: 'Isle of Man',
  J: 'OUTSIDE BOUNDARIES',
}
