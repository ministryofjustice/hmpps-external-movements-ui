import { Request, Response } from 'express'
import { SchemaType } from './schemas'

const emptyInputs = {
  count: '',
  type: '',
  startTimeHour: '',
  startTimeMinute: '',
  returnTimeHour: '',
  returnTimeMinute: '',
}

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
      startDate: req.journeyData.addTemporaryAbsence!.start,
      endDate: req.journeyData.addTemporaryAbsence!.end,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : 'repeating-pattern',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    // break check-answers bounce back routing if new pattern is submitted
    delete req.journeyData.isCheckAnswers

    if (req.body.save !== undefined) {
      req.journeyData.addTemporaryAbsence!.shiftPattern = req.body.items.map(
        ({ count, type, startTimeHour, startTimeMinute, returnTimeHour, returnTimeMinute }) =>
          type === 'REST'
            ? { type: 'REST', count: count as number }
            : {
                type: type as 'DAY' | 'NIGHT',
                count: count as number,
                startTime: `${startTimeHour}:${startTimeMinute}`,
                returnTime: `${returnTimeHour}:${returnTimeMinute}`,
              },
      )

      return res.redirect('check-absences')
    }

    // fallback no-js handling for add/remove actions
    req.body.items ??= [emptyInputs]
    if (req.body.add !== undefined) {
      // @ts-expect-error raw inputs have different data types from validated inputs for save action
      req.body.items.push(emptyInputs)
    } else if (req.body.remove !== undefined) {
      req.body.items.splice(Number(req.body.remove), 1)
    }
    // Always redirect back to input even if we didn't find an action, which should be impossible but there is a small
    // possibility if JS is disabled after a page load or the user somehow removes all identities.
    req.flash('formResponses', JSON.stringify(req.body))
    return res.redirect(req.originalUrl)
  }
}
