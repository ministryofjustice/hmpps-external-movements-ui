import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { components } from '../../../../../@types/externalMovements'

export class EditTapSelectLocationController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { authorisation, locationOption } = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/select-location/view', {
      backUrl: 'autofill-occurrences',
      authorisation,
      locationOption: locationOption !== undefined ? String(locationOption) : null,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

    if (req.body.locationOption === 'MULTIPLE') {
      journey.locationOption = req.body.locationOption
      res.redirect('match-absences-and-locations')
      return
    }

    try {
      const request: components['schemas']['AuthorisationActions'] = {
        actions: [
          {
            type: 'ChangeAuthorisationDateRange',
            start: journey.start!,
            end: journey.end!,
          },
        ],
      }

      const occurrences = journey.newOccurrences!.map(({ start, end }) => ({
        start,
        end,
        location: journey.authorisation.locations[req.body.locationOption as number]!,
        ...(journey.authorisation.comments ? { comments: journey.authorisation.comments } : {}),
      }))
      if (occurrences.length) {
        request.actions.push({
          type: 'CreateOccurrences',
          occurrences,
        })
      }

      journey.result = await this.externalMovementsService.updateTapAuthorisationMultiActions(
        { res },
        journey.authorisation.id,
        request,
        journey.authorisation,
      )
      req.journeyData.journeyCompleted = true
      res.redirect(
        journey.result!.content.length
          ? 'confirmation'
          : `/temporary-absence-authorisations/${journey.authorisation.id}`,
      )
    } catch (e) {
      next(e)
    }
  }
}
