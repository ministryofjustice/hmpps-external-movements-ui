import { EditTapAuthorisationEnterLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { enterLocationSchema } from '../../../add-temporary-absence/enter-location/schema'

export const EditTapAuthorisationEnterLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAuthorisationEnterLocationController()

  get('/', controller.GET)
  post('/', validate(enterLocationSchema), controller.POST)

  return router
}
