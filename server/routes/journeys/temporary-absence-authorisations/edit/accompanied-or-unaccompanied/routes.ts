import { BaseRouter } from '../../../../common/routes'
import { EditTapAuthorisationAccompaniedOrUnaccompaniedController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EditTapAuthorisationAccompaniedOrUnaccompaniedRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAuthorisationAccompaniedOrUnaccompaniedController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
