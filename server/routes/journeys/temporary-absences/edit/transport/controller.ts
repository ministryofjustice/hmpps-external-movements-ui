import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'

export class EditTransportController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('temporary-absences/edit/transport/view', {
      options: await this.externalMovementsService.getReferenceData({ res }, 'transport'),
      backUrl: '../edit',
      transport:
        res.locals['formResponses']?.['transport'] ?? req.journeyData.updateTapOccurrence!.occurrence.transport.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!

    if (journey.authorisation.repeat) {
      journey.transport = req.body.transport
      journey.changeType = 'transport'
      res.redirect('apply-change')
    } else {
      // TODO: send API call to apply change
      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        `You’ve updated the temporary absence transport for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
      )
      res.redirect(
        `/temporary-absence-authorisations/${journey.authorisation.id}?date=${formatInputDate(journey.occurrence.releaseAt)}`,
      )
    }
  }
}
