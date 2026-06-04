import { NextFunction, Request, Response } from 'express'
import { differenceInDays, format, subDays } from 'date-fns'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { getOccurrencesToMatch } from '../../../add-temporary-absence/utils'
import { components } from '../../../../../@types/externalMovements'
import { UpdateTapAuthorisationJourney } from '../../../../../@types/journeys'

export class EditTapAutofillOccurrencesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/autofill-occurrences/view', {
      backUrl: 'start-end-dates',
      occurrences: this.getOccurrences(req).map(({ start, end }) => {
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          returnDate: format(end, 'yyyy-MM-dd'),
          startTime: format(start, 'HH:mm'),
          returnTime: format(end, 'HH:mm'),
        }
      }),
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
