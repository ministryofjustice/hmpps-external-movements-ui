import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SelectDaysTimesWeeklyController {
  GET = async (req: Request, res: Response) => {
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const getDayTimes = (dayIndex: number) => {
      const day = req.journeyData.addTemporaryAbsence?.weeklyPattern?.find(o => o.day === dayIndex)
      const startTime = day?.startTime
      const returnTime = day?.returnTime
      const isOvernight = day?.overnight

      const days = res.locals.formResponses?.['days'] as
        | {
            releaseHour: string
            releaseMinute: string
            returnHour: string
            returnMinute: string
            isOvernight: string
          }[]
        | null

      return {
        index: dayIndex,
        day: weekDays[dayIndex],
        nextDay: weekDays[(dayIndex + 1) % 7],
        releaseHour: days?.[dayIndex]?.releaseHour ?? startTime?.split(':')[0] ?? '',
        releaseMinute: days?.[dayIndex]?.releaseMinute ?? startTime?.split(':')[1] ?? '',
        returnHour: days?.[dayIndex]?.returnHour ?? returnTime?.split(':')[0] ?? '',
        returnMinute: days?.[dayIndex]?.returnMinute ?? returnTime?.split(':')[1] ?? '',
        isOvernight: days?.[dayIndex]?.isOvernight ?? isOvernight ?? '',
      }
    }

    res.render('add-temporary-absence/select-days-times-weekly/view', {
      backUrl: 'repeating-pattern',
      days:
        res.locals.formResponses?.['selectedDays'] ??
        req.journeyData.addTemporaryAbsence?.weeklyPattern?.map(o => weekDays[o.day]) ??
        [],
      dayData: [...Array(7).keys()].map(i => getDayTimes(i)),
      startDate: req.journeyData.addTemporaryAbsence!.start,
      endDate: req.journeyData.addTemporaryAbsence!.end,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    // break check-answers bounce back routing if new pattern is submitted
    delete req.journeyData.isCheckAnswers

    req.journeyData.addTemporaryAbsence!.weeklyPattern = req.body
    res.redirect('check-absences')
  }
}
