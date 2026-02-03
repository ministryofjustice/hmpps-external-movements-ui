import { EditTapOccurrenceEnterLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { Services } from '../../../../../services'
import { enterLocationSchema } from '../../../add-temporary-absence/enter-location/schema'

export const EditTapOccurrenceEnterLocationRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapOccurrenceEnterLocationController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(enterLocationSchema), controller.submitToApi, controller.POST)

  return router
}
