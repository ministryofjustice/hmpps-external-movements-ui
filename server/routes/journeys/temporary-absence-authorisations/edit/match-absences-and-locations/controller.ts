import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { components } from '../../../../../@types/externalMovements'

export class EditTapMatchAbsencesAndLocationsController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const formResponseLocations = res.locals.formResponses?.['locations'] as string[] | null

    res.render('temporary-absence-authorisations/edit/match-absences-and-locations/view', {
      backUrl: 'select-location',
      occurrences: req.journeyData.updateTapAuthorisation!.newOccurrences!.map((itm, idx) => {
        const locationIdx = formResponseLocations?.[idx]
        if (locationIdx) return { ...itm, locationIdx: Number(locationIdx) }
        return itm
      }),
      locations: req.journeyData.updateTapAuthorisation!.authorisation.locations,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

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

      const occurrences = journey.newOccurrences!.map(({ start, end }, idx) => ({
        start,
        end,
        location: journey.authorisation.locations[req.body.locations[idx]!]!,
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
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    res.redirect(
      journey.result!.content.length ? 'confirmation' : `/temporary-absence-authorisations/${journey.authorisation.id}`,
    )
  }
}
