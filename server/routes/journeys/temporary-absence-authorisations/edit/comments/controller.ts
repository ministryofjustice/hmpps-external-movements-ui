import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../../utils/formatUtils'

export class EditAbsenceCommentsController {
  GET = async (req: Request, res: Response) => {
    res.render('temporary-absence-authorisations/edit/comments/view', {
      backUrl: '../edit',
      notes: res.locals['formResponses']?.['notes'] ?? req.journeyData.updateTapAuthorisation!.authorisation.notes,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.updateTapAuthorisation!
    // TODO: send API call to apply change
    req.flash(
      FLASH_KEY__SUCCESS_BANNER,
      `You’ve updated the temporary absence comments for ${firstNameSpaceLastName(req.journeyData.prisonerDetails!)}.`,
    )
    res.redirect(`/temporary-absence-authorisations/${journey.authorisation.id}`)
  }
}
