import { Request, Response } from 'express'
import { addDays, differenceInDays, format } from 'date-fns'
import { AddTapFlowControl } from '../flow'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'

export class CheckPatternController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.addTemporaryAbsence!.isCheckPattern = true

    const numberOfWeeks = Math.ceil(
      (differenceInDays(req.journeyData.addTemporaryAbsence!.toDate!, req.journeyData.addTemporaryAbsence!.fromDate!) +
        2) /
        7,
    )

    const periods = Array.from(new Array(numberOfWeeks).keys()).map(idx => {
      const startDate = format(addDays(req.journeyData.addTemporaryAbsence!.fromDate!, idx * 7), 'yyyy-MM-dd')
      let endDate = format(addDays(req.journeyData.addTemporaryAbsence!.fromDate!, idx * 7 + 6), 'yyyy-MM-dd')
      if (endDate > req.journeyData.addTemporaryAbsence!.toDate!) endDate = req.journeyData.addTemporaryAbsence!.toDate!

      return {
        startDate,
        endDate,
        absences: this.getAbsencesFromPeriod(
          req.journeyData.addTemporaryAbsence!,
          startDate,
          endDate,
          idx === numberOfWeeks - 1,
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

  private getAbsencesFromPeriod = (
    journey: AddTemporaryAbsenceJourney,
    fromDate: string,
    toDate: string,
    isFinalWeek: boolean,
  ) => {
    if (journey.patternType === 'FREEFORM') {
      return journey.freeFormPattern!.filter(
        ({ startDate, returnDate }) => startDate >= fromDate && (isFinalWeek ? returnDate : startDate) <= toDate,
      )
    }

    if (journey.patternType === 'WEEKLY') {
      const startDoW = new Date(fromDate).getDay() - 1
      return journey
        .weeklyPattern!.map(({ day, overnight, startTime, returnTime }) => {
          const dayDiff = (day - startDoW + 7) % 7
          const startDate = addDays(new Date(fromDate), dayDiff)
          const returnDate = overnight ? addDays(startDate, 1) : startDate
          return {
            startDate: format(startDate, 'yyyy-MM-dd'),
            returnDate: format(returnDate, 'yyyy-MM-dd'),
            startTime,
            returnTime,
          }
        })
        .filter(
          ({ startDate, returnDate }) => startDate >= fromDate && (isFinalWeek ? returnDate : startDate) <= toDate,
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
    }

    // TODO: add support for rotating pattern
    return undefined
  }
}
