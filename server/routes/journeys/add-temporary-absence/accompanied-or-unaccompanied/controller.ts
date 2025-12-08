import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'

export class AccompaniedOrUnaccompaniedController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/accompanied-or-unaccompanied/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, this.getNormalPreviousPage(req.journeyData.addTemporaryAbsence!)),
      accompanied:
        res.locals.formResponses?.['accompanied'] ??
        req.journeyData.addTemporaryAbsence!.accompaniedSubJourney?.accompanied ??
        req.journeyData.addTemporaryAbsence!.accompanied,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { accompanied: req.body.accompanied }))
  }

  getNormalPreviousPage = (journey: AddTemporaryAbsenceJourney) => {
    if (!journey.repeat) {
      if (journey.location?.id) return 'search-location'
      return 'enter-location'
    }
    if (journey.locations?.length === 1) return 'search-locations'
    return 'match-absences-and-locations'
  }
}
