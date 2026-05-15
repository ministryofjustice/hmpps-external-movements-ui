import { AddTapOccurrenceLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { redirectAndForwardValidationErrorsHandler } from '../../../../../middleware/validation/redirectAndForwardValidationErrorsHandler'
import { searchedAddressSchemaFactory } from './searched-address/schema'
import { enteredAddressSchema } from './entered-address/schema'
import { areaSchema } from './area/schema'
import { selectedLocationSchema } from './selected-location/schema'

export const AddTapOccurrenceLocationRoutes = ({ osPlacesAddressService, externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapOccurrenceLocationController(externalMovementsService)

  get('/', controller.GET)

  get('/selected-location', redirectAndForwardValidationErrorsHandler('../location#select-location'))
  post('/selected-location', validate(selectedLocationSchema), controller.postSelectedLocation)

  get('/searched-address', redirectAndForwardValidationErrorsHandler('../location#search-location'))
  post(
    '/searched-address',
    validate(searchedAddressSchemaFactory(osPlacesAddressService)),
    controller.postSearchedAddress,
  )

  get('/entered-address', redirectAndForwardValidationErrorsHandler('../location#enter-address'))
  post('/entered-address', validate(enteredAddressSchema), controller.postEnteredAddress)

  get('/area', redirectAndForwardValidationErrorsHandler('../location#enter-area'))
  post('/area', validate(areaSchema), controller.postArea)

  return router
}
