import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class EnterRotatingPatternController {
  private getDefaultItems = () => {
    return [
      { count: '', type: 'Scheduled days' },
      { count: '', type: 'Rest days' },
    ]
  }

  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/enter-rotating-pattern/view', {
      items:
        res.locals.formResponses?.['items'] ??
        req.journeyData.addTemporaryAbsence!.rotatingPatternSubJourney?.intervals ??
        req.journeyData.addTemporaryAbsence!.rotatingPattern?.intervals ??
        this.getDefaultItems(),
      startDate: req.journeyData.addTemporaryAbsence!.fromDate,
      endDate: req.journeyData.addTemporaryAbsence!.toDate,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : 'repeating-pattern',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.journeyData.addTemporaryAbsence!.rotatingPatternSubJourney) {
      req.journeyData.addTemporaryAbsence!.rotatingPatternSubJourney.intervals = req.body.items
    } else {
      req.journeyData.addTemporaryAbsence!.rotatingPatternSubJourney = { intervals: req.body.items }
    }

    res.redirect('select-same-times')
  }
}
