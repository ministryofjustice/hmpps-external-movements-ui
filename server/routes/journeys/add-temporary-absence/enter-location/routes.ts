import { BaseRouter } from '../../../common/routes'
import { EnterLocationController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EnterLocationRoutes = ({ personalRelationshipsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EnterLocationController(personalRelationshipsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
