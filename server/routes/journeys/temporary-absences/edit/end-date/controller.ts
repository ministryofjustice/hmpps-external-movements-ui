import { Request, Response } from 'express'
import { format } from 'date-fns'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'

export class EditEndDateController {
  GET = async (req: Request, res: Response) => {
    const returnDate =
      res.locals['formResponses']?.['returnDate'] ??
      format(req.journeyData.updateTapOccurrence!.occurrence.returnBy, 'd/M/yyyy')

    const returnTimeHour =
      res.locals['formResponses']?.['returnTimeHour'] ??
      format(req.journeyData.updateTapOccurrence!.occurrence.returnBy, 'HH')
    const returnTimeMinute =
      res.locals['formResponses']?.['returnTimeMinute'] ??
      format(req.journeyData.updateTapOccurrence!.occurrence.returnBy, 'mm')

    res.render('temporary-absences/edit/end-date/view', {
      backUrl: req.journeyData.updateTapOccurrence!.changeType === 'start-date' ? 'start-date' : '../edit',
      startDate:
        req.journeyData.updateTapOccurrence!.changeType === 'start-date'
          ? req.journeyData.updateTapOccurrence!.startDate
          : format(req.journeyData.updateTapOccurrence!.occurrence.releaseAt, 'yyyy-MM-dd'),
      returnDate,
      returnTimeHour,
      returnTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapOccurrence!
    journey.returnDate = req.body.returnDate
    journey.returnTime = `${req.body.returnTimeHour}:${req.body.returnTimeMinute}`

    if (journey.authorisation.repeat) {
      if (journey.changeType !== 'start-date') journey.changeType = 'end-date'
      res.redirect('apply-change')
    } else {
      // TODO: send API call to apply change
      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        `You’ve updated the temporary absence ${journey.changeType === 'start-date' ? 'release/return' : 'release'} date and time for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
      )
      res.redirect(
        `/temporary-absence-authorisations/${journey.authorisation.id}?date=${formatInputDate(journey.occurrence.releaseAt)}`,
      )
    }
  }
}
