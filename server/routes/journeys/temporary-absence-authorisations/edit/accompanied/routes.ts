import { EditTapAuthorisationAccompaniedController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schemas'
import { BaseRouter } from '../../../../common/routes'
import { Services } from '../../../../../services'

export const EditTapAuthorisationAccompaniedRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAuthorisationAccompaniedController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(externalMovementsService)), controller.POST)

  return router
}
