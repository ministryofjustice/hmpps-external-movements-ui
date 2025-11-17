import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class EnterShiftPatternController {
  private getDefaultItems = () => {
    return [
      { count: '', type: 'DAY' },
      { count: '', type: 'REST' },
    ]
  }

  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/enter-shift-pattern/view', {
      items:
        res.locals.formResponses?.['items'] ??
        req.journeyData.addTemporaryAbsence!.shiftPattern?.map(({ type, count, startTime, returnTime }) => {
          const [startTimeHour, startTimeMinute] = startTime?.split(':') ?? ['', '']
          const [returnTimeHour, returnTimeMinute] = returnTime?.split(':') ?? ['', '']
          return {
            type,
            count,
            startTimeHour,
            startTimeMinute,
            returnTimeHour,
            returnTimeMinute,
          }
        }) ??
        this.getDefaultItems(),
      startDate: req.journeyData.addTemporaryAbsence!.fromDate,
      endDate: req.journeyData.addTemporaryAbsence!.toDate,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : 'repeating-pattern',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.shiftPattern = req.body.items.map(
      ({ count, type, startTimeHour, startTimeMinute, returnTimeHour, returnTimeMinute }) =>
        type === 'REST'
          ? { type, count }
          : {
              type,
              count,
              startTime: `${startTimeHour}:${startTimeMinute}`,
              returnTime: `${returnTimeHour}:${returnTimeMinute}`,
            },
    )

    res.redirect('check-absences')
  }
}
