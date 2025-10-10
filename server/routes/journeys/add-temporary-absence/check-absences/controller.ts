import { Request, Response } from 'express'
import { addDays, differenceInDays, format } from 'date-fns'
import { AddTapFlowControl } from '../flow'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'

export class CheckPatternController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.addTemporaryAbsence!.isCheckPattern = true

    const numberOfWeeks = Math.ceil(
      differenceInDays(req.journeyData.addTemporaryAbsence!.toDate!, req.journeyData.addTemporaryAbsence!.fromDate!) /
        7,
    )

    const periods = Array.from(new Array(numberOfWeeks).keys()).map(idx => {
      const startDate = format(addDays(req.journeyData.addTemporaryAbsence!.fromDate!, idx * 7), 'yyyy-MM-dd')
      let endDate = format(addDays(req.journeyData.addTemporaryAbsence!.fromDate!, idx * 7 + 6), 'yyyy-MM-dd')
      if (endDate > req.journeyData.addTemporaryAbsence!.toDate!) endDate = req.journeyData.addTemporaryAbsence!.toDate!

      return {
        startDate,
        endDate,
        absences: this.getAbsencesFromPeriod(req.journeyData.addTemporaryAbsence!, startDate, endDate),
      }
    })

    res.render('add-temporary-absence/check-absences/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'repeating-pattern'),
      patternType: req.journeyData.addTemporaryAbsence!.patternType,
      periods,
      freeFormPattern: req.journeyData.addTemporaryAbsence!.freeFormPattern,
      weeklyPattern: req.journeyData.addTemporaryAbsence!.weeklyPattern,
    })
  }

  POST = (req: Request, res: Response) =>
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'location-type')

  private getAbsencesFromPeriod = (journey: AddTemporaryAbsenceJourney, fromDate: string, toDate: string) => {
    if (journey.patternType === 'FREEFORM') {
      return journey.freeFormPattern!.filter(({ startDate }) => startDate >= fromDate && startDate <= toDate)
    }

    // TODO: add support for other pattern types
    return undefined
  }
}
