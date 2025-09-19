import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { getReferenceDataOptionsForRadios } from '../../../common/utils'

export class LocationTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const locationTypeOptions = await getReferenceDataOptionsForRadios(
      this.externalMovementsService,
      res,
      'location-type',
      res.locals['formResponses']?.['locationType'] ?? req.journeyData.addTemporaryAbsence!.locationType,
    )
    res.render('add-temporary-absence/location-type/view', { locationTypeOptions, backUrl: 'end-date' })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.locationType = req.body['locationType']
    res.redirect('location-search')
  }
}
