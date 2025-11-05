import { Request, Response } from 'express'
import { addDays, differenceInDays, format } from 'date-fns'
import { AddTapFlowControl } from '../flow'
import { getOccurrencesToMatch } from '../utils'

export class CheckPatternController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.addTemporaryAbsence!.isCheckPattern = true

    const numberOfWeeks = Math.ceil(
      (differenceInDays(req.journeyData.addTemporaryAbsence!.toDate!, req.journeyData.addTemporaryAbsence!.fromDate!) +
        2) /
        7,
    )
    const occurrences = getOccurrencesToMatch(req).map(({ releaseAt, returnBy }) => {
      const releaseDate = new Date(releaseAt)
      const returnDate = new Date(returnBy)
      return {
        startDate: format(releaseDate, 'yyyy-MM-dd'),
        returnDate: format(returnDate, 'yyyy-MM-dd'),
        startTime: format(releaseDate, 'HH:mm'),
        returnTime: format(returnDate, 'HH:mm'),
      }
    })

    const periods = Array.from(new Array(numberOfWeeks).keys()).map(idx => {
      const startDate = format(addDays(req.journeyData.addTemporaryAbsence!.fromDate!, idx * 7), 'yyyy-MM-dd')
      let endDate = format(addDays(req.journeyData.addTemporaryAbsence!.fromDate!, idx * 7 + 6), 'yyyy-MM-dd')
      if (endDate > req.journeyData.addTemporaryAbsence!.toDate!) endDate = req.journeyData.addTemporaryAbsence!.toDate!

      return {
        startDate,
        endDate,
        absences: occurrences.filter(o => o.startDate >= startDate && o.returnDate <= endDate),
      }
    })

    res.render('add-temporary-absence/check-absences/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'repeating-pattern'),
      changeUrl:
        req.journeyData.addTemporaryAbsence?.patternType === 'ROTATING'
          ? 'enter-rotating-pattern'
          : 'select-days-times-weekly',
      patternType: req.journeyData.addTemporaryAbsence!.patternType,
      periods,
    })
  }

  POST = (req: Request, res: Response) =>
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'search-locations')
}
