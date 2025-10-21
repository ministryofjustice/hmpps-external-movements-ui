import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SelectDaysTimesWeeklyController {
  GET = async (req: Request, res: Response) => {
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const getDayTimes = (dayIndex: number) => {
      const day = req.journeyData.addTemporaryAbsence?.weeklyPattern?.find(o => o.day === dayIndex)
      const startTime = day?.startTime
      const returnTime = day?.overnight ? '' : day?.returnTime
      const overnightTime = day?.overnight ? day?.returnTime : ''
      const isOvernight = day?.overnight

      return {
        index: dayIndex,
        day: weekDays[dayIndex],
        nextDay: weekDays[(dayIndex + 1) % 7],
        releaseHour: res.locals['formResponses']?.days[dayIndex].releaseHour ?? startTime?.split(':')[0] ?? '',
        releaseMinute: res.locals['formResponses']?.days[dayIndex].releaseMinute ?? startTime?.split(':')[1] ?? '',
        returnHour: res.locals['formResponses']?.days[dayIndex].returnHour ?? returnTime?.split(':')[0] ?? '',
        returnMinute: res.locals['formResponses']?.days[dayIndex].returnMinute ?? returnTime?.split(':')[1] ?? '',
        overnightHour: res.locals['formResponses']?.days[dayIndex].overnightHour ?? overnightTime?.split(':')[0] ?? '',
        overnightMinute:
          res.locals['formResponses']?.days[dayIndex].overnightMinute ?? overnightTime?.split(':')[1] ?? '',
        isOvernight: res.locals['formResponses']?.days[dayIndex].isOvernight ?? isOvernight ?? '',
      }
    }

    res.render('add-temporary-absence/select-days-times-weekly/view', {
      backUrl: 'repeating-pattern',
      days:
        res.locals['formResponses']?.['selectedDays'] ??
        req.journeyData.addTemporaryAbsence?.weeklyPattern?.map(o => weekDays[o.day]) ??
        [],
      dayData: [...Array(7).keys()].map(i => getDayTimes(i)),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.weeklyPattern = req.body
    res.redirect('check-absences')
  }
}
