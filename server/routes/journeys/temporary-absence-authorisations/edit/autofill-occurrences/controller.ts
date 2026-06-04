import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { getOccurrencesToMatch } from '../../../add-temporary-absence/utils'

export class EditTapAutofillOccurrencesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { authorisation, start, end } = req.journeyData.updateTapAuthorisation!
    // @ts-expect-error cast TAP authorisation into an incomplete addTemporaryAbsence journey data
    req.journeyData.addTemporaryAbsence = {
      ...authorisation.schedule!,
      start: start!,
      end: end!,
      patternType: authorisation.schedule!.type as 'FREEFORM' | 'WEEKLY' | 'BIWEEKLY' | 'SHIFT',
    }

    const occurrences = getOccurrencesToMatch(req)

    res.render('temporary-absence-authorisations/edit/autofill-occurrences/view', {
      backUrl: 'start-end-dates',
      authorisation,
      occurrences,
    })
  }

  POST = async (req: Request, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

    try {
      journey.result = await this.externalMovementsService.updateTapAuthorisation({ res }, journey.authorisation.id, {
        type: 'ChangeAuthorisationDateRange',
        start: journey.start!,
        end: journey.end!,
      })
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
