import { Request, Response } from 'express'
import { components } from '../../../@types/externalMovements'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../utils/constants'
import { ManageTapAuthorisationBaseClass } from '../utils'

export class TapApprovalController extends ManageTapAuthorisationBaseClass {
  handleGet = async (
    authorisation: components['schemas']['TapAuthorisation'],
    _req: Request<{ id: string }>,
    res: Response,
  ) => {
    res.render('temporary-absence-authorisations/approval/view', {
      showBreadcrumbs: true,
      result: authorisation,
      approve: res.locals.formResponses?.['approve'],
      approveReason: res.locals.formResponses?.['approveReason'],
      rejectReason: res.locals.formResponses?.['rejectReason'],
    })
  }

  POST = async (req: Request<{ id: string }, unknown, SchemaType>, res: Response) => {
    // TODO: send API call to apply change
    if (req.body.approve) {
      req.flash(FLASH_KEY__SUCCESS_BANNER, `You’ve approved the temporary absence.`)
    } else {
      req.flash(FLASH_KEY__SUCCESS_BANNER, `You’ve rejected the temporary absence.`)
    }

    res.redirect(`/temporary-absence-authorisations/${req.params.id}`)
  }
}
