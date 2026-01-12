import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { parseAddress } from '../../../../../utils/utils'

export class EditTapOccurrenceSearchLocationController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { location, authorisation, backUrl } = req.journeyData.updateTapOccurrence!

    res.render('temporary-absences/edit/search-location/view', {
      backUrl: authorisation.locations.length <= 1 ? backUrl : 'select-location',
      uprn: location?.id ? String(location?.id) : null,
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.address,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!

    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'ChangeOccurrenceLocation',
        location: parseAddress({
          id: Number(req.body.uprn!),
          address: req.body.addressString ?? null,
          description: req.body.description,
          postcode: req.body.postcode,
        }),
      })
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!
    res.redirect(journey.result!.content.length ? 'confirmation' : `/temporary-absences/${journey.occurrence.id}`)
  }
}
