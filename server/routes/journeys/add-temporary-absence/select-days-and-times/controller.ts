import { Request, Response } from 'express'
import { getSelectDayRange } from './utils'
import { SchemaType } from './schema'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class FreeformSelectDaysController {
  GET = async (req: Request<{ idx?: string }>, res: Response) => {
    const { startDate, endDate, outOfRange, previousIdx, nextIdx, isOptional, pageCount, idx } = getSelectDayRange(req)
    if (outOfRange) return res.notFound()

    let backUrl = previousIdx ?? (req.params.idx === undefined ? 'repeating-pattern' : '../repeating-pattern')
    if (req.journeyData.addTemporaryAbsence!.isCheckPattern)
      backUrl = req.params.idx === undefined ? 'check-absences' : '../check-absences'

    return res.render('add-temporary-absence/select-days-and-times/view', {
      backUrl,
      startDate,
      endDate,
      start: req.journeyData.addTemporaryAbsence!.start,
      end: req.journeyData.addTemporaryAbsence!.end,
      freeFormPattern: req.journeyData.addTemporaryAbsence!.freeFormPattern ?? [],
      idx,
      pageCount,
      isLastMonth: nextIdx === undefined,
      isOptional,
      absences:
        res.locals.formResponses?.['absences'] ??
        this.getAbsencesFromJourney(req.journeyData.addTemporaryAbsence!, startDate, endDate),
    })
  }

  POST = async (req: Request<{ idx?: string }, unknown, SchemaType>, res: Response) => {
    const { startDate: start, endDate: end, nextIdx } = getSelectDayRange(req)
    if (req.body.save !== undefined) {
      req.journeyData.addTemporaryAbsence!.freeFormPattern ??= []

      req.journeyData.addTemporaryAbsence!.freeFormPattern =
        req.journeyData.addTemporaryAbsence!.freeFormPattern.filter(
          ({ startDate }) => !(startDate >= start && startDate <= end),
        )

      req.journeyData.addTemporaryAbsence!.freeFormPattern.push(
        ...req.body.absences.map(
          ({ startDate, startTimeHour, startTimeMinute, returnDate, returnTimeHour, returnTimeMinute }) => ({
            startDate,
            startTime: `${startTimeHour}:${startTimeMinute}`,
            returnDate,
            returnTime: `${returnTimeHour}:${returnTimeMinute}`,
          }),
        ),
      )

      if (nextIdx && !req.journeyData.addTemporaryAbsence!.isCheckPattern) {
        return res.redirect(req.params.idx === undefined ? `select-days-and-times/${nextIdx}` : nextIdx)
      }

      return res.redirect(req.params.idx === undefined ? 'check-absences' : '../check-absences')
    }

    // TODO: handle add and remove actions for no-js support
    return res.redirect('')
  }

  private getAbsencesFromJourney = (journey: AddTemporaryAbsenceJourney, from: string, to: string) => {
    const absences = journey.freeFormPattern
      ?.filter(({ startDate }) => startDate >= from && startDate <= to)
      .map(({ startDate, startTime, returnDate, returnTime }) => {
        const [startTimeHour, startTimeMinute] = startTime.split(':')
        const [returnTimeHour, returnTimeMinute] = returnTime.split(':')
        return {
          startDate: formatInputDate(startDate),
          startTimeHour,
          startTimeMinute,
          returnDate: formatInputDate(returnDate),
          returnTimeHour,
          returnTimeMinute,
        }
      })

    if (absences?.length) return absences
    return undefined
  }
}
