import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { getBackToTapAuthorisationDetails } from '../utils'

export class TapCancelController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/cancel/view', {
      backUrl: getBackToTapAuthorisationDetails(req, res),
      reason: res.locals.formResponses?.['reason'],
      authorisation: req.journeyData.updateTapAuthorisation!.authorisation,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!
    try {
      journey.result = await this.externalMovementsService.updateTapAuthorisation({ res }, journey.authorisation.id, {
        type: 'CancelAuthorisation',
        reason: req.body.reason,
      })
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    res.redirect(
      journey.result!.content.length ? 'confirmation' : `/temporary-absence-authorisations/${journey.authorisation.id}`,
    )
  }
}
