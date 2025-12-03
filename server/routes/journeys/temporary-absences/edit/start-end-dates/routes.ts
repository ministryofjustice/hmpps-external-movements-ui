import { BaseRouter } from '../../../../common/routes'
import { EditOccurrenceStartEndDatesController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditOccurrenceStartEndDatesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditOccurrenceStartEndDatesController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
