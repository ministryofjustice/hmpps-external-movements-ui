import { SelectDaysTimesWeeklyController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schemas'
import { BaseRouter } from '../../../common/routes'

export const SelectDaysTimesWeeklyRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new SelectDaysTimesWeeklyController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
