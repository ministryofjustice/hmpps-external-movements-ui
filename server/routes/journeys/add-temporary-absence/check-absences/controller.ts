import { Request, Response } from 'express'
import { addDays, subDays, addMonths, differenceInDays, endOfMonth, format, startOfMonth } from 'date-fns'
import { AddTapFlowControl } from '../flow'
import { getOccurrencesToMatch } from '../utils'

export class CheckPatternController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.addTemporaryAbsence!.isCheckPattern = true

    res.render('add-temporary-absence/check-absences/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'repeating-pattern'),
      patternType: req.journeyData.addTemporaryAbsence!.patternType,
      periods: this.getPeriod(req),
    })
  }

  POST = (req: Request, res: Response) =>
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'search-locations')

  private getPeriod = (req: Request) => {
    const occurrences = getOccurrencesToMatch(req).map(({ start, end }) => {
      return {
        startDate: format(start, 'yyyy-MM-dd'),
        returnDate: format(end, 'yyyy-MM-dd'),
        startTime: format(start, 'HH:mm'),
        returnTime: format(end, 'HH:mm'),
      }
    })

    if (req.journeyData.addTemporaryAbsence!.patternType === 'FREEFORM') {
      const numberOfMonths =
        (new Date(req.journeyData.addTemporaryAbsence!.end!).getMonth() -
          new Date(req.journeyData.addTemporaryAbsence!.start!).getMonth() +
          13) %
        12

      return Array.from(new Array(numberOfMonths).keys()).map(idx => {
        const startDate =
          idx === 0
            ? req.journeyData.addTemporaryAbsence!.start!
            : format(addMonths(startOfMonth(new Date(req.journeyData.addTemporaryAbsence!.start!)), idx), 'yyyy-MM-dd')
        const endDate =
          idx === numberOfMonths - 1
            ? req.journeyData.addTemporaryAbsence!.end!
            : format(endOfMonth(new Date(startDate)), 'yyyy-MM-dd')

        const overnightNewWeekDay = format(addDays(endDate, 1), 'yyyy-MM-dd')
        const isOvernight = (o: { startDate: string; returnDate: string }) => o.returnDate !== o.startDate

        return {
          startDate,
          endDate,
          absences: occurrences.filter(
            o =>
              o.startDate >= startDate &&
              (o.returnDate <= endDate || (isOvernight(o) && o.returnDate === overnightNewWeekDay)),
          ),
        }
      })
    }

    const diffFromMonthday = (new Date(req.journeyData.addTemporaryAbsence!.start!).getDay() + 6) % 7
    const start = format(subDays(req.journeyData.addTemporaryAbsence!.start!, diffFromMonthday), 'yyyy-MM-dd')
    const numberOfWeeks = Math.ceil((differenceInDays(req.journeyData.addTemporaryAbsence!.end!, start) + 2) / 7)

    return Array.from(new Array(numberOfWeeks).keys()).map(idx => {
      const startDate = format(addDays(start, idx * 7), 'yyyy-MM-dd')
      let endDate = format(addDays(start, idx * 7 + 6), 'yyyy-MM-dd')
      if (endDate > req.journeyData.addTemporaryAbsence!.end!) endDate = req.journeyData.addTemporaryAbsence!.end!

      const overnightNewWeekDay = format(addDays(endDate, 1), 'yyyy-MM-dd')
      const isOvernight = (o: { startDate: string; returnDate: string }) => o.returnDate !== o.startDate

      return {
        startDate,
        endDate,
        absences: occurrences.filter(
          o =>
            o.startDate >= startDate &&
            (o.returnDate <= endDate || (isOvernight(o) && o.returnDate === overnightNewWeekDay)),
        ),
      }
    })
  }
}
