import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditStartEndDatesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, authorisation, start, end } = req.journeyData.updateTapAuthorisation!

    res.render('temporary-absence-authorisations/edit/start-end-dates/view', {
      backUrl,
      start:
        res.locals.formResponses?.['start'] ??
        (start && formatInputDate(start)) ??
        formatInputDate(authorisation.start),
      end: res.locals.formResponses?.['end'] ?? (end && formatInputDate(end)) ?? formatInputDate(authorisation.end),
      hasRepeatPattern: ['BIWEEKLY', 'WEEKLY', 'SHIFT'].includes(authorisation.schedule?.type ?? ''),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

    if (!['BIWEEKLY', 'WEEKLY', 'SHIFT'].includes(journey.authorisation.schedule?.type ?? '')) {
      try {
        journey.result = await this.externalMovementsService.updateTapAuthorisation({ res }, journey.authorisation.id, {
          type: 'ChangeAuthorisationDateRange',
          start: req.body.start,
          end: req.body.end,
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
      return
    }

    journey.start = req.body.start
    journey.end = req.body.end

    res.redirect('autofill-occurrences')
  }
}
