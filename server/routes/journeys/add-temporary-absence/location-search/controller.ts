import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { SchemaType } from './schema'

export class LocationSearchController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/location-search/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'location-type'),
      locationSearch:
        res.locals['formResponses']?.['locationSearch'] ?? req.journeyData.addTemporaryAbsence!.locationSearch,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.locationSearch = req.body.locationSearch
    res.redirect('location-search')
  }

  selectLocation = async (req: Request<{ locationId: string }>, res: Response) => {
    res.redirect(
      `../../${AddTapFlowControl.saveDataAndGetNextPage(req, {
        location: {
          id: req.params.locationId,
          street: '147 Marlborough Road',
          postcode: 'N19 5QH',
          cityDescription: 'London',
          countryDescription: 'England',
        },
      })}`,
    )
  }
}
