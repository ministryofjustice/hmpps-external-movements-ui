import { EditTapAuthorisationSearchLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const EditTapAuthorisationSearchLocationRoutes = ({ osPlacesAddressService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAuthorisationSearchLocationController()

  get('/', controller.GET)
  post('/', validate(schemaFactory(osPlacesAddressService)), controller.POST)

  return router
}
