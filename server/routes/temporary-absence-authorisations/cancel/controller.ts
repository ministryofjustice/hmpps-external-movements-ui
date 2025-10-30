import { Request, Response } from 'express'
import { components } from '../../../@types/externalMovements'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../utils/constants'
import { ManageTapAuthorisationBaseClass } from '../utils'

export class TapCancelController extends ManageTapAuthorisationBaseClass {
  handleGet = async (
    authorisation: components['schemas']['TapAuthorisation'],
    _req: Request<{ id: string }>,
    res: Response,
  ) => {
    res.render('temporary-absence-authorisations/cancel/view', {
      showBreadcrumbs: true,
      result: authorisation,
      reason: res.locals.formResponses?.['reason'],
    })
  }

  POST = async (req: Request<{ id: string }, unknown, SchemaType>, res: Response) => {
    // TODO: send API call to apply change
    req.flash(FLASH_KEY__SUCCESS_BANNER, `You’ve cancelled the temporary absence.`)
    res.redirect(`/temporary-absence-authorisations/${req.params.id}`)
  }
}
