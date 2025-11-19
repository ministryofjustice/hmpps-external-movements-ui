import { SelectDaysTimesBiWeeklyController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from '../select-days-times-weekly/schemas'
import { BaseRouter } from '../../../common/routes'

export const SelectDaysTimesBiWeeklyRoutes = (week: 'FIRST' | 'SECOND') => {
  const { router, get, post } = BaseRouter()
  const controller = new SelectDaysTimesBiWeeklyController()

  get('/', controller.GET(week))
  post('/', validate(schema), controller.POST(week))

  return router
}
