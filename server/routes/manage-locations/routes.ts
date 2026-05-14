import type { NextFunction, Request, Response } from 'express'
import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { ManageLocationsController } from './controller'
import { Page } from '../../services/auditService'
import { validate } from '../../middleware/validation/validationMiddleware'
import { searchLocationSchemaFactory } from './add-searched-address/schema'
import { enterNewLocationSchema } from './add-address/schema'
import { enterAreaSchema } from './add-area/schema'
import { removeLocationSchema } from './remove-location/schema'
import { redirectAndForwardValidationErrorsHandler } from '../../middleware/validation/redirectAndForwardValidationErrorsHandler'
import { FLASH_KEY__FORM_RESPONSES, FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export const ManageLocationsRoutes = ({ externalMovementsService, osPlacesAddressService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ManageLocationsController(externalMovementsService)

  get('/', Page.SEARCH_PRISONER, controller.GET)

  get('/add-searched-address', redirectAndForwardValidationErrorsHandler('../manage-locations'))
  post(
    '/add-searched-address',
    validate(searchLocationSchemaFactory(osPlacesAddressService)),
    controller.postSearchedAddress,
  )
  get('/add-address', redirectAndForwardValidationErrorsHandler('../manage-locations#enter-address'))
  post('/add-address', validate(enterNewLocationSchema), controller.postEnteredAddress)

  get('/add-area', redirectAndForwardValidationErrorsHandler('../manage-locations#enter-area'))
  post('/add-area', validate(enterAreaSchema), controller.postArea)

  get('/remove-location', redirectAndForwardValidationErrorsHandler('../manage-locations'))
  post('/remove-location', validate(removeLocationSchema), controller.postRemoveLocation)

  router.use((error: { responseStatus?: number }, req: Request, res: Response, next: NextFunction) => {
    if (error?.responseStatus === 409) {
      req.flash(
        FLASH_KEY__VALIDATION_ERRORS,
        JSON.stringify({
          apiError: [
            'Another user has made changes to the temporary absence locations. Please review the new list and try your action again if required.',
          ],
        }),
      )
      req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))
      res.redirect(req.get('Referrer') ?? (req.method === 'GET' ? '/' : req.originalUrl))
    } else {
      next(error)
    }
  })

  return router
}
