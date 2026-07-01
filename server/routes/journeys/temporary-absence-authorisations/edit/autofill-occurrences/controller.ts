import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { getOccurrences, iterateCalendarDays } from '../utils'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export class EditTapAutofillOccurrencesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { authorisation, start, end } = req.journeyData.updateTapAuthorisation!

    const occurrences = getOccurrences(req).map(occ => {
      return {
        startDate: format(occ.start, 'yyyy-MM-dd'),
        returnDate: format(occ.end, 'yyyy-MM-dd'),
        startTime: format(occ.start, 'HH:mm'),
        returnTime: format(occ.end, 'HH:mm'),
      }
    })

    const calendarDays = [
      ...iterateCalendarDays(occurrences[0]!.startDate, occurrences[occurrences.length - 1]!.startDate),
    ].map(day => {
      const date = `${String(day.month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`
      const occs = occurrences.filter(({ startDate }) => startDate.endsWith(date))
      if (occs.length === 1) {
        return { ...day, occurrence: occs[0] }
      }
      if (occs.length > 1) {
        return {
          ...day,
          occurrence: {
            ...occs[0],
            returnTime: occs[occs.length - 1]!.returnTime,
            multi: true,
          },
        }
      }
      return day
    })

    res.render('temporary-absence-authorisations/edit/autofill-occurrences/view', {
      backUrl: 'start-end-dates',
      authorisation,
      start,
      end,
      prependOccurrences: occurrences.filter(({ startDate }) => startDate < authorisation.start),
      appendOccurrences: occurrences.filter(({ returnDate }) => returnDate > authorisation.end),
      occurrences,
      calendar: Object.entries(Object.groupBy(calendarDays, ({ month }) => MONTH_NAMES[month]!)).map(
        ([month, days]) => [
          month,
          days?.reduce((acc, _, i) => {
            if (i % 7 === 0) acc.push(days.slice(i, i + 7))
            return acc
          }, [] as unknown[]),
        ],
      ),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

    if (!req.body.confirm) {
      res.redirect(`/temporary-absence-authorisations/${journey.authorisation.id}`)
      return
    }

    try {
      const occurrences = getOccurrences(req as Request).map(({ start, end }) => ({
        start,
        end,
        location: journey.authorisation.locations[0]!,
        ...(journey.authorisation.comments ? { comments: journey.authorisation.comments } : {}),
      }))
      journey.result = await this.externalMovementsService.updateTapAuthorisationMultiActions(
        { res },
        journey.authorisation.id,
        {
          actions: [
            {
              type: 'ChangeAuthorisationDateRange',
              start: journey.start!,
              end: journey.end!,
            },
            {
              type: 'CreateOccurrences',
              occurrences,
            },
          ],
        },
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
