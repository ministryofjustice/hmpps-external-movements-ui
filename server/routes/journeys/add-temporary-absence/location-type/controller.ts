import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

export class LocationTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const locationType =
      res.locals['formResponses']?.locationType ||
      req.journeyData.addTemporaryAbsence!.locationSubJourney?.locationType ||
      req.journeyData.addTemporaryAbsence!.locationType

    res.render('add-temporary-absence/location-type/view', {
      locationTypeOptions: await this.externalMovementsService.getReferenceData({ res }, 'location-type'),
      backUrl: 'end-date',
      locationType: locationType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.journeyData.addTemporaryAbsence!.locationType?.code !== req.body.locationType.code) {
      req.journeyData.addTemporaryAbsence!.locationSubJourney = { locationType: req.body.locationType }
    }
    res.redirect('location-search')
  }
}
