import { BaseRouter } from '../../../common/routes'
import { MultiAbsencesPerDayController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const MultiAbsencesPerDayRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new MultiAbsencesPerDayController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
