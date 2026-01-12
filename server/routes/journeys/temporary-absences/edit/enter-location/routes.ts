import { EditTapOccurrenceEnterLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditTapOccurrenceEnterLocationRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapOccurrenceEnterLocationController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
