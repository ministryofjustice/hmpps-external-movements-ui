import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

export class LocationTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const locationTypeOptions = (await this.externalMovementsService.getReferenceData({ res }, 'location-type')).map(
      refData => ({
        value: refData.code,
        text: refData.description,
        hint: refData.hintText ? { text: refData.hintText } : undefined,
      }),
    )

    const locationType =
      res.locals['formResponses']?.['locationType'] ||
      req.journeyData.addTemporaryAbsence!.locationSubJourney?.locationType ||
      req.journeyData.addTemporaryAbsence!.locationType

    res.render('add-temporary-absence/location-type/view', {
      locationTypeOptions,
      backUrl: 'end-date',
      locationType: locationType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.locationSubJourney ??= {}
    req.journeyData.addTemporaryAbsence!.locationSubJourney.locationType = req.body['locationType']
    res.redirect('location-search')
  }
}
