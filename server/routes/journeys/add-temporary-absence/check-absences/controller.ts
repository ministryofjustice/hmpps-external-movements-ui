import { Request, Response } from 'express'
import { addDays, differenceInDays, format } from 'date-fns'
import { AddTapFlowControl } from '../flow'
import { getOccurrencesToMatch } from '../utils'

export class CheckPatternController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.addTemporaryAbsence!.isCheckPattern = true

    const numberOfWeeks = Math.ceil(
      (differenceInDays(req.journeyData.addTemporaryAbsence!.end!, req.journeyData.addTemporaryAbsence!.start!) + 2) /
        7,
    )
    const occurrences = getOccurrencesToMatch(req).map(({ start, end }) => {
      return {
        startDate: format(start, 'yyyy-MM-dd'),
        returnDate: format(end, 'yyyy-MM-dd'),
        startTime: format(start, 'HH:mm'),
        returnTime: format(end, 'HH:mm'),
      }
    })

    const periods = Array.from(new Array(numberOfWeeks).keys()).map(idx => {
      const startDate = format(addDays(req.journeyData.addTemporaryAbsence!.start!, idx * 7), 'yyyy-MM-dd')
      let endDate = format(addDays(req.journeyData.addTemporaryAbsence!.start!, idx * 7 + 6), 'yyyy-MM-dd')
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

    res.render('add-temporary-absence/check-absences/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'repeating-pattern'),
      patternType: req.journeyData.addTemporaryAbsence!.patternType,
      periods,
    })
  }

  POST = (req: Request, res: Response) =>
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'search-locations')
}
