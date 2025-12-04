import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'

export class EditStartEndDatesController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/start-end-dates/view', {
      backUrl: req.journeyData.updateTapAuthorisation!.backUrl,
      fromDate:
        res.locals.formResponses?.['fromDate'] ??
        formatInputDate(req.journeyData.updateTapAuthorisation!.authorisation.fromDate),
      toDate:
        res.locals.formResponses?.['toDate'] ??
        formatInputDate(req.journeyData.updateTapAuthorisation!.authorisation.toDate),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!
    try {
      journey.result = await this.externalMovementsService.updateTapAuthorisation({ res }, journey.authorisation.id, {
        type: 'ChangeAuthorisationDateRange',
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
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
