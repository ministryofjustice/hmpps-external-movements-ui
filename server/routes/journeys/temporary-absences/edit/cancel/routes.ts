import { Services } from '../../../../../services'
import { BaseRouter } from '../../../../common/routes'
import { TapOccurrenceCancelController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const TapOccurrenceCancelRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new TapOccurrenceCancelController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
