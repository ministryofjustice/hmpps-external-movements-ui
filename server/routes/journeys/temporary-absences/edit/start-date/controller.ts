import { Request, Response } from 'express'
import { format } from 'date-fns'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'

export class EditStartDateController {
  GET = async (req: Request, res: Response) => {
    const startDate =
      res.locals.formResponses?.['startDate'] ??
      format(req.journeyData.updateTapOccurrence!.occurrence.releaseAt, 'd/M/yyyy')

    const startTimeHour =
      res.locals.formResponses?.['startTimeHour'] ??
      format(req.journeyData.updateTapOccurrence!.occurrence.releaseAt, 'HH')
    const startTimeMinute =
      res.locals.formResponses?.['startTimeMinute'] ??
      format(req.journeyData.updateTapOccurrence!.occurrence.releaseAt, 'mm')

    res.render('temporary-absences/edit/start-date/view', {
      backUrl: '../edit',
      startDate,
      startTimeHour,
      startTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!
    journey.startDate = req.body.startDate
    journey.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`

    // proceed to end-date page if the new start-date invalidates the existing end-date
    if (
      `${req.body.startDate} ${req.body.startTimeHour}:${req.body.startTimeMinute}` >=
      format(req.journeyData.updateTapOccurrence!.occurrence.returnBy, 'yyyy-MM-dd HH:mm')
    ) {
      journey.changeType = 'start-date'
      return res.redirect('end-date')
    }

    if (journey.authorisation.repeat) {
      journey.changeType = 'start-date'
      return res.redirect('apply-change')
    }
    // TODO: send API call to apply change
    req.flash(
      FLASH_KEY__SUCCESS_BANNER,
      `You’ve updated the temporary absence release date and time for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
    )
    return res.redirect(
      `/temporary-absence-authorisations/${journey.authorisation.id}?date=${formatInputDate(journey.occurrence.releaseAt)}`,
    )
  }
}
