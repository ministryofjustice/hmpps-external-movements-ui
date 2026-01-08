import { SelectDaysTimesBiWeeklyController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { BaseRouter } from '../../../common/routes'
import { schemaFactory } from './schemas'

export const SelectDaysTimesBiWeeklyRoutes = (week: 'FIRST' | 'SECOND') => {
  const { router, get, post } = BaseRouter()
  const controller = new SelectDaysTimesBiWeeklyController()

  get('/', controller.GET(week))
  post('/', validate(schemaFactory(week)), controller.POST(week))

  return router
}
