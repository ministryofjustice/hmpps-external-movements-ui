import { BaseRouter } from '../../../../common/routes'
import { EditTapSelectLocationController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditTapSelectLocationRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapSelectLocationController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
