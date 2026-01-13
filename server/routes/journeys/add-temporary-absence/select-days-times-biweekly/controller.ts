import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SelectDaysTimesBiWeeklyController {
  GET = (week: 'FIRST' | 'SECOND') => async (req: Request, res: Response) => {
    req.journeyData.addTemporaryAbsence!.biweeklyPattern ??= { weekA: [], weekB: [] }
    const { biweeklyPattern, start, end } = req.journeyData.addTemporaryAbsence!

    const pattern = week === 'FIRST' ? biweeklyPattern!.weekA : biweeklyPattern!.weekB

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const getDayTimes = (dayIndex: number) => {
      const day = pattern?.find(o => o.day === dayIndex)
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

    res.render('add-temporary-absence/select-days-times-biweekly/view', {
      backUrl: week === 'FIRST' ? 'repeating-pattern' : 'select-days-times-biweekly',
      days: res.locals.formResponses?.['selectedDays'] ?? pattern?.map(o => weekDays[o.day]) ?? [],
      dayData: [...Array(7).keys()].map(i => getDayTimes(i)),
      week,
      startDate: start,
      endDate: end,
      biweeklyPattern,
    })
  }

  POST = (week: 'FIRST' | 'SECOND') => async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    // break check-answers bounce back routing if new pattern is submitted
    delete req.journeyData.isCheckAnswers

    if (week === 'FIRST') {
      req.journeyData.addTemporaryAbsence!.biweeklyPattern!.weekA = req.body
      res.redirect('select-days-times-biweekly-continued')
    } else {
      req.journeyData.addTemporaryAbsence!.biweeklyPattern!.weekB = req.body
      res.redirect('check-absences')
    }
  }
}
