import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { parseAddress } from '../../../../../utils/utils'
import { EnterLocationSchemaType } from '../../../add-temporary-absence/enter-location/schema'

export class EditTapOccurrenceEnterLocationController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (_req: Request, res: Response) => {
    res.render('temporary-absences/edit/enter-location/view', {
      backUrl: 'search-location',
      description: res.locals.formResponses?.['description'],
      line1: res.locals.formResponses?.['line1'],
      line2: res.locals.formResponses?.['line2'],
      city: res.locals.formResponses?.['city'],
      county: res.locals.formResponses?.['county'],
      postcode: res.locals.formResponses?.['postcode'],
    })
  }

  submitToApi = async (req: Request<unknown, unknown, EnterLocationSchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapOccurrence!

    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'ChangeOccurrenceLocation',
        location: parseAddress(req.body),
      })
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!
    res.redirect(journey.result!.content.length ? 'confirmation' : `/temporary-absences/${journey.occurrence.id}`)
  }
}
