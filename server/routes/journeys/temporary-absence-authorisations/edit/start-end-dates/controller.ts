import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'

export class EditStartEndDatesController {
  GET = async (req: Request, res: Response) => {
    const fromDate =
      res.locals['formResponses']?.['fromDate'] ??
      formatInputDate(req.journeyData.updateTapAuthorisation!.authorisation.fromDate)

    const toDate =
      res.locals['formResponses']?.['toDate'] ??
      formatInputDate(req.journeyData.updateTapAuthorisation!.authorisation.toDate)

    res.render('temporary-absence-authorisations/edit/start-end-dates/view', {
      backUrl: '../edit',
      fromDate,
      toDate,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!

    // TODO: send API call to apply change

    let changes = ''
    if (journey.authorisation.fromDate !== req.body.fromDate && journey.authorisation.toDate !== req.body.toDate) {
      changes = 'start date and end date'
    } else if (journey.authorisation.toDate !== req.body.toDate) {
      changes = 'end date'
    } else {
      changes = 'start date'
    }
    req.flash(
      FLASH_KEY__SUCCESS_BANNER,
      `You’ve updated the temporary absence ${changes} for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
    )
    res.redirect(`/temporary-absence-authorisations/${journey.authorisation.id}`)
  }
}
