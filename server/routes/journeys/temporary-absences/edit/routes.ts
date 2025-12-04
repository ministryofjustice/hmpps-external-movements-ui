import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { EditOccurrenceStartEndDatesRoutes } from './start-end-dates/routes'
import { EditTapOccurrenceConfirmationRoutes } from './confirmation/routes'
import { EditAbsenceCommentsRoutes } from './comments/routes'

export const EditTapOccurrenceRoutes = (services: Services) => {
  const { router } = BaseRouter()

  router.use('/start-end-dates', EditOccurrenceStartEndDatesRoutes(services))
  router.use('/confirmation', EditTapOccurrenceConfirmationRoutes())
  router.use('/comments', EditAbsenceCommentsRoutes(services))

  return router
}
