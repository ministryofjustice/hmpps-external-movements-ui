import { BaseRouter } from '../../../../common/routes'
import { EditTapOccurrenceSelectLocationController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditTapOccurrenceSelectLocationRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapOccurrenceSelectLocationController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
