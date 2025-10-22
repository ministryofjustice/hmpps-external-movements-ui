import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class EnterRotatingPatternController {
  private getDefaultItems = () => {
    return [
      { number: '', type: 'Scheduled days' },
      { number: '', type: 'Rest days' },
    ]
  }

  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/enter-rotating-pattern/view', {
      items:
        res.locals['formResponses']?.['items'] ??
        req.journeyData.addTemporaryAbsence!.rotatingPattern ??
        this.getDefaultItems(),
      startDate: req.journeyData.addTemporaryAbsence!.fromDate,
      endDate: req.journeyData.addTemporaryAbsence!.toDate,
      backUrl: 'repeating-pattern',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.rotatingPattern = req.body.items
    res.redirect('select-same-times')
  }
}
