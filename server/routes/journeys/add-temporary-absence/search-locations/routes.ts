import { SearchLocationsController } from './controller'
import { BaseRouter } from '../../../common/routes'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { redirectAndForwardValidationErrorsHandler } from '../../../../middleware/validation/redirectAndForwardValidationErrorsHandler'
import { selectedLocationSchema } from '../location/selected-location/schema'
import { searchedAddressSchemaFactory } from '../location/searched-address/schema'
import { enteredAddressSchema } from '../location/entered-address/schema'
import { areaSchema } from '../location/area/schema'

export const SearchLocationsRoutes = ({ osPlacesAddressService, externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new SearchLocationsController(externalMovementsService)

  get('/', controller.GET)
  post('/', controller.POST)

  get('/remove/:itm', controller.remove)

  get('/selected-location', redirectAndForwardValidationErrorsHandler('../search-locations#select-location'))
  post('/selected-location', validate(selectedLocationSchema), controller.postSelectedLocation)

  get('/searched-address', redirectAndForwardValidationErrorsHandler('../search-locations#search-location'))
  post(
    '/searched-address',
    validate(searchedAddressSchemaFactory(osPlacesAddressService)),
    controller.postSearchedAddress,
  )

  get('/entered-address', redirectAndForwardValidationErrorsHandler('../search-locations#enter-address'))
  post('/entered-address', validate(enteredAddressSchema), controller.postEnteredAddress)

  get('/area', redirectAndForwardValidationErrorsHandler('../search-locations#enter-area'))
  post('/area', validate(areaSchema), controller.postArea)

  return router
}
