import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { getOccurrencesToMatch } from '../utils'
import { SchemaType } from './schema'

export class MatchAbsencesAndLocationsController {
  GET = async (req: Request, res: Response) => {
    this.setOccurrencesToMatch(req, res)

    res.render('add-temporary-absence/match-absences-and-locations/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'search-locations'),
      occurrences: req.journeyData.addTemporaryAbsence!.occurrencesToMatch,
      locations: req.journeyData.addTemporaryAbsence!.locations,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const occurrences = req.journeyData.addTemporaryAbsence!.occurrencesToMatch!.map(
      ({ releaseAt, returnBy }, idx) => ({
        releaseAt,
        returnBy,
        locationIdx: req.body.locations[idx]!,
      }),
    )
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { occurrences }))
  }

  setOccurrencesToMatch = (req: Request, res: Response) => {
    const journey = req.journeyData.addTemporaryAbsence!
    const formResponseLocations = res.locals.formResponses?.['locations'] as string[] | null

    journey.occurrencesToMatch = getOccurrencesToMatch(req).map((occurrence, idx) => {
      if (formResponseLocations && formResponseLocations[idx]) {
        return { ...occurrence, locationIdx: Number(formResponseLocations[idx]) }
      }
      if (journey.occurrences) {
        const matched = journey.occurrences?.find(
          itm => itm.releaseAt === occurrence.releaseAt && itm.returnBy === occurrence.returnBy,
        )
        if (matched) return { ...occurrence, locationIdx: matched.locationIdx }
      }
      return occurrence
    })
  }
}
