import { AddTapOccurrenceEnterLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { enterLocationSchema } from '../../../add-temporary-absence/enter-location/schema'

export const AddTapOccurrenceEnterLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapOccurrenceEnterLocationController()

  get('/', controller.GET)
  post('/', validate(enterLocationSchema), controller.POST)

  return router
}
