import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SelectDaysTimesWeeklyController {
  GET = async (req: Request, res: Response) => {
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const getDayTimes = (dayIndex: number) => {
      const day = weekDays[dayIndex]
      const dayObj = req.journeyData.addTemporaryAbsence?.weeklyPattern?.find(o => o.day === day)
      const startTime = dayObj?.startTime
      const returnTime = dayObj?.overnight ? '' : dayObj?.returnTime
      const overnightTime = dayObj?.overnight ? dayObj?.startTime : ''
      const isOvernight = dayObj?.overnight

      return {
        day,
        nextDay: weekDays[(dayIndex + 1) % 7],
        releaseHour: res.locals['formResponses']?.[`${day}ReleaseHour`] ?? startTime?.split(':')[0] ?? '',
        releaseMinute: res.locals['formResponses']?.[`${day}ReleaseMinute`] ?? startTime?.split(':')[1] ?? '',
        returnHour: res.locals['formResponses']?.[`${day}ReturnHour`] ?? returnTime?.split(':')[0] ?? '',
        returnMinute: res.locals['formResponses']?.[`${day}ReturnMinute`] ?? returnTime?.split(':')[1] ?? '',
        overnightHour: res.locals['formResponses']?.[`${day}OvernightHour`] ?? overnightTime?.split(':')[0] ?? '',
        overnightMinute: res.locals['formResponses']?.[`${day}OvernightMinute`] ?? overnightTime?.split(':')[1] ?? '',
        isOvernight: res.locals['formResponses']?.[`${day}IsOvernight`] ?? isOvernight ?? '',
      }
    }

    res.render('add-temporary-absence/select-days-times-weekly/view', {
      backUrl: 'repeating-pattern',
      days:
        res.locals['formResponses']?.['days'] ??
        req.journeyData.addTemporaryAbsence?.weeklyPattern?.map(o => o.day) ??
        [],
      dayData: [...Array(7).keys()].map(i => getDayTimes(i)),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.weeklyPattern = req.body
    res.redirect('check-absences-weekly')
  }
}
