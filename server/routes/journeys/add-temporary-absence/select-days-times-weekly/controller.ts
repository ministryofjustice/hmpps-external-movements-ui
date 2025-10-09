import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SelectDaysTimesWeeklyController {
  GET = async (req: Request, res: Response) => {
    const getDayTimes = (day: string) => {
      const dayObj = req.journeyData.addTemporaryAbsence?.weeklyPattern?.find(o => o.day === day)
      const startTime = dayObj?.startTime
      const returnTime = dayObj?.overnight ? '' : dayObj?.returnTime
      const overnightTime = dayObj?.overnight ? dayObj?.startTime : ''
      const isOvernight = dayObj?.overnight

      return {
        [`${day}ReleaseHour`]: res.locals['formResponses']?.[`${day}ReleaseHour`] ?? startTime?.split(':')[0] ?? '',
        [`${day}ReleaseMinute`]: res.locals['formResponses']?.[`${day}ReleaseMinute`] ?? startTime?.split(':')[1] ?? '',
        [`${day}ReturnHour`]: res.locals['formResponses']?.[`${day}ReturnHour`] ?? returnTime?.split(':')[0] ?? '',
        [`${day}ReturnMinute`]: res.locals['formResponses']?.[`${day}ReturnMinute`] ?? returnTime?.split(':')[1] ?? '',
        [`${day}OvernightHour`]:
          res.locals['formResponses']?.[`${day}OvernightHour`] ?? overnightTime?.split(':')[0] ?? '',
        [`${day}OvernightMinute`]:
          res.locals['formResponses']?.[`${day}OvernightMinute`] ?? overnightTime?.split(':')[1] ?? '',
        [`${day}IsOvernight`]: res.locals['formResponses']?.[`${day}IsOvernight`] ?? isOvernight ?? '',
      }
    }

    res.render('add-temporary-absence/select-days-times-weekly/view', {
      backUrl: 'repeating-pattern',
      days: res.locals['formResponses']?.['days'] ?? [],
      ...getDayTimes('monday'),
      ...getDayTimes('tuesday'),
      ...getDayTimes('wednesday'),
      ...getDayTimes('thursday'),
      ...getDayTimes('friday'),
      ...getDayTimes('saturday'),
      ...getDayTimes('sunday'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.weeklyPattern = req.body
    res.redirect('check-absences-weekly')
  }
}
