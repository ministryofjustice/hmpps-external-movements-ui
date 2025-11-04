import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { EditTapOccurrenceController } from './controller'
import { EditTransportRoutes } from './transport/routes'
import { EditAbsenceCommentsRoutes } from './comments/routes'
import { EditStartDateRoutes } from './start-date/routes'
import { EditEndDateRoutes } from './end-date/routes'

export const EditTapOccurrenceRoutes = (services: Services) => {
  const { router, get } = BaseRouter()
  const controller = new EditTapOccurrenceController()

  get('/', controller.GET)

  router.use('/start-date', EditStartDateRoutes(services))
  router.use('/end-date', EditEndDateRoutes(services))
  router.use('/transport', EditTransportRoutes(services))
  router.use('/comments', EditAbsenceCommentsRoutes())

  return router
}
