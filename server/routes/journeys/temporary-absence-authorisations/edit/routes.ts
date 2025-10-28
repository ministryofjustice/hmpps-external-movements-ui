import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { EditTapAuthorisationController } from './controller'
import { EditAbsenceCommentsRoutes } from './comments/routes'
import { EditStartEndDatesRoutes } from './start-end-dates/routes'

export const EditTapAuthorisationRoutes = (_services: Services) => {
  const { router, get } = BaseRouter()
  const controller = new EditTapAuthorisationController()

  get('/', controller.GET)

  router.use('/comments', EditAbsenceCommentsRoutes())
  router.use('/start-end-dates', EditStartEndDatesRoutes())

  return router
}
