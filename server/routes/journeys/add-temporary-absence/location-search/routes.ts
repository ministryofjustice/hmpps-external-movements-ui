import { LocationSearchController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { BaseRouter } from '../../../common/routes'

export const LocationSearchRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new LocationSearchController()

  get('/', controller.GET)
  get('/select/:locationId', controller.selectLocation)
  post('/', validate(schema), controller.POST)

  return router
}
