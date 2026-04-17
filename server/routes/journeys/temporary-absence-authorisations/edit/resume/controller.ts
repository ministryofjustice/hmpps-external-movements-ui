import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'

export class TapResumeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/resume/view', {
      backUrl: req.journeyData.updateTapAuthorisation!.backUrl,
      authorisation: req.journeyData.updateTapAuthorisation!.authorisation,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    if (!req.body.resume) {
      next()
      return
    }

    const journey = req.journeyData.updateTapAuthorisation!
    try {
      journey.result = await this.externalMovementsService.updateTapAuthorisation({ res }, journey.authorisation.id, {
        type: 'ResumeAuthorisation',
      })
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!
    req.journeyData.journeyCompleted = true
    res.redirect(
      journey.result?.content.length ? 'confirmation' : `/temporary-absence-authorisations/${journey.authorisation.id}`,
    )
  }
}
