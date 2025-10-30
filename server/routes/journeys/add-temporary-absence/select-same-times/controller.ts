import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SelectSameTimesController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/select-same-times/view', {
      sameTimes:
        res.locals['formResponses']?.['sameTimes'] ??
        req.journeyData.addTemporaryAbsence?.rotatingPatternSubJourney?.isSameTime ??
        req.journeyData.addTemporaryAbsence?.rotatingPattern?.isSameTime,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : 'enter-rotating-pattern',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.journeyData.addTemporaryAbsence?.rotatingPatternSubJourney) {
      req.journeyData.addTemporaryAbsence.rotatingPatternSubJourney.isSameTime = req.body.isSameTime
    }

    res.redirect('rotating-release-return-times')
  }
}
