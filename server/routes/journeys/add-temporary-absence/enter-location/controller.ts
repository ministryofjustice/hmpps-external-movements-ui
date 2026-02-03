import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { EnterLocationSchemaType } from './schema'
import { Address } from '../../../../@types/journeys'

export class EnterLocationController {
  GET = async (req: Request, res: Response) => {
    const { location: singleTapLocation, repeat } = req.journeyData.addTemporaryAbsence!
    const location = repeat || singleTapLocation?.id ? null : singleTapLocation

    res.render('add-temporary-absence/enter-location/view', {
      backUrl: repeat ? 'search-locations' : 'search-location',
      description: res.locals.formResponses?.['description'] ?? location?.description,
      line1: res.locals.formResponses?.['line1'] ?? location?.line1,
      line2: res.locals.formResponses?.['line2'] ?? location?.line2,
      city: res.locals.formResponses?.['city'] ?? location?.city,
      county: res.locals.formResponses?.['county'] ?? location?.county,
      postcode: res.locals.formResponses?.['postcode'] ?? location?.postcode,
    })
  }

  POST = async (req: Request<unknown, unknown, EnterLocationSchemaType>, res: Response) => {
    const address: Address = req.body

    if (req.journeyData.addTemporaryAbsence!.repeat) {
      delete req.journeyData.isCheckAnswers // break check-answers bounce back routing if locations are changed
      req.journeyData.addTemporaryAbsence!.locations ??= []
      req.journeyData.addTemporaryAbsence!.locations.push(address)
      res.redirect('search-locations')
    } else {
      res.redirect(
        AddTapFlowControl.saveDataAndGetNextPage(req, {
          location: address,
        }),
      )
    }
  }
}
