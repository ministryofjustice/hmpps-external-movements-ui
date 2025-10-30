import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { TapApprovalController } from './controller'
import { validate } from '../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const TapApprovalRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new TapApprovalController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
