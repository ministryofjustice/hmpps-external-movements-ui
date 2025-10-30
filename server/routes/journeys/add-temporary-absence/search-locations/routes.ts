import { SearchLocationsController } from './controller'
import { BaseRouter } from '../../../common/routes'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const SearchLocationsRoutes = ({ osPlacesAddressService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new SearchLocationsController()

  get('/', controller.GET)
  get('/remove/:itm', controller.remove)
  post('/', validate(schemaFactory(osPlacesAddressService)), controller.POST)

  return router
}
