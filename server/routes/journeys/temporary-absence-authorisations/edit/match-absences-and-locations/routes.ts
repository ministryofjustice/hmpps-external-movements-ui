import { EditTapMatchAbsencesAndLocationsController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { BaseRouter } from '../../../../common/routes'
import { Services } from '../../../../../services'

export const EditTapMatchAbsencesAndLocationsRoute = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapMatchAbsencesAndLocationsController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
