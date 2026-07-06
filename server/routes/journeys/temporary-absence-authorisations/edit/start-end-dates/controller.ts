import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import { getOccurrences } from '../utils'

export class EditStartEndDatesController {
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

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    journey.start = req.body.start
    journey.end = req.body.end
    journey.newOccurrences = ['BIWEEKLY', 'WEEKLY', 'SHIFT'].includes(journey.authorisation.schedule?.type ?? '')
      ? getOccurrences(req as Request)
      : []

    res.redirect('autofill-occurrences')
  }
}
