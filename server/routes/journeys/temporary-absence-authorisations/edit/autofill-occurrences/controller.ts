import { NextFunction, Request, Response } from 'express'
import { differenceInDays, format, subDays } from 'date-fns'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { getOccurrencesToMatch } from '../../../add-temporary-absence/utils'
import { components } from '../../../../../@types/externalMovements'
import { UpdateTapAuthorisationJourney } from '../../../../../@types/journeys'
import { SchemaType } from './schema'

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

function* iterateCalendarDays(dateFrom: string, dateTo: string) {
  const currentDay = new Date(dateFrom)
  let currentMonth = currentDay.getMonth()

  const beginPadStartLength = (currentDay.getDay() + 6) % 7

  if (beginPadStartLength) {
    for (let i = beginPadStartLength; i > 0; i -= 1) {
      const day = new Date(dateFrom)
      day.setDate(day.getDate() - i)
      yield {
        month: currentMonth,
        date: day.getMonth() === currentMonth ? day.getDate() : '',
        inRange: false,
      }
    }
  }

  while (currentDay.toLocaleDateString('en-CA') <= dateTo) {
    if (currentDay.getMonth() !== currentMonth) {
      const padStartLength = (currentDay.getDay() + 6) % 7
      if (padStartLength) {
        for (let i = 0; i < 7 - padStartLength; i += 1) {
          yield {
            month: currentMonth,
            date: '',
            inRange: false,
          }
        }

        for (let i = 0; i < padStartLength; i += 1) {
          yield {
            month: currentDay.getMonth(),
            date: '',
            inRange: false,
          }
        }
      }
    }
    currentMonth = currentDay.getMonth()
    yield {
      month: currentDay.getMonth(),
      date: currentDay.getDate(),
      inRange: true,
    }
    currentDay.setDate(currentDay.getDate() + 1)
  }
}

export class EditTapAutofillOccurrencesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { authorisation, start, end } = req.journeyData.updateTapAuthorisation!

    const occurrences = this.getOccurrences(req).map(occ => {
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
      const occurrences = this.getOccurrences(req as Request).map(({ start, end }) => ({
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

  getOccurrences = (req: Request) => {
    const { authorisation, start, end } = req.journeyData.updateTapAuthorisation!

    if (!['WEEKLY', 'BIWEEKLY', 'SHIFT'].includes(authorisation.schedule!.type ?? '')) {
      throw new Error('Invalid TAP plan to auto fill occurrences')
    }

    // @ts-expect-error cast TAP authorisation into an incomplete addTemporaryAbsence journey data
    req.journeyData.addTemporaryAbsence = {
      ...authorisation.schedule!,
      start: this.getStartDate(req.journeyData.updateTapAuthorisation!),
      end: end!,
      patternType: authorisation.schedule!.type as 'WEEKLY' | 'BIWEEKLY' | 'SHIFT',
    }

    const occurrences = getOccurrencesToMatch(req)

    return occurrences.filter(itm => {
      const startDate = itm.start.substring(0, 10)
      const endDate = itm.end.substring(0, 10)

      return startDate >= start! && (startDate < authorisation.start || endDate > authorisation.end)
    })
  }

  getStartDate = (journey: UpdateTapAuthorisationJourney) => {
    const { authorisation, start } = journey

    if (authorisation.start === start) return start
    if (authorisation.start < start!) return authorisation.start

    const cycleLength = this.getRepeatCycle(journey)
    const daysBeforeOriginalStart = Math.ceil(differenceInDays(authorisation.start, start!) / cycleLength) * cycleLength

    return format(subDays(authorisation.start, daysBeforeOriginalStart), 'yyyy-MM-dd')
  }

  getRepeatCycle = (journey: UpdateTapAuthorisationJourney) => {
    const { authorisation } = journey
    if (authorisation.schedule!.type === 'WEEKLY') return 7
    if (authorisation.schedule!.type === 'BIWEEKLY') return 14

    return (authorisation.schedule as components['schemas']['ShiftSchedule']).shiftPattern.reduce(
      (ttl, itm) => ttl + itm.count,
      0,
    )
  }
}
