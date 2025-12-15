import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditTapAuthorisationAccompaniedController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/accompanied/view', {
      backUrl:
        req.journeyData.updateTapAuthorisation!.accompanied === undefined
          ? req.journeyData.updateTapAuthorisation!.backUrl
          : 'accompanied-or-unaccompanied',
      accompaniedByOptions: await this.externalMovementsService.getReferenceData({ res }, 'accompanied-by'),
      accompaniedBy:
        res.locals.formResponses?.['accompaniedBy'] ||
        req.journeyData.updateTapAuthorisation?.accompaniedBy?.code ||
        req.journeyData.updateTapAuthorisation?.authorisation?.accompaniedBy.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.accompaniedBy = req.body.accompaniedBy
    res.redirect('change-confirmation')
  }
}
