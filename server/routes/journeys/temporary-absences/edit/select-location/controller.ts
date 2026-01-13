import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditTapOccurrenceSelectLocationController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { authorisation, backUrl, locationOption } = req.journeyData.updateTapOccurrence!

    res.render('temporary-absences/edit/select-location/view', {
      backUrl,
      authorisation,
      locationOption: locationOption !== undefined ? String(locationOption) : null,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!

    try {
      if (req.body.locationOption !== 'NEW') {
        journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
          type: 'ChangeOccurrenceLocation',
          location: journey.authorisation.locations[req.body.locationOption]!,
        })
      } else {
        journey.locationOption = req.body.locationOption
      }
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!
    if (!journey.result) {
      res.redirect('search-location')
    } else {
      res.redirect(journey.result.content.length ? 'confirmation' : `/temporary-absences/${journey.occurrence.id}`)
    }
  }
}
