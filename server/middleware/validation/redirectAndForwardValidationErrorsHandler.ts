import { Request, Response } from 'express'
import { FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export const redirectAndForwardValidationErrorsHandler = (redirectUrl: string) => (req: Request, res: Response) => {
  if (res.locals['validationErrors']) {
    req.flash(FLASH_KEY__VALIDATION_ERRORS, JSON.stringify(res.locals['validationErrors']))
  }
  res.redirect(redirectUrl)
}
