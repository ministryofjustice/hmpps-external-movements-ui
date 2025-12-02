import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { EditAbsenceCommentsRoutes } from './comments/routes'
import { EditStartEndDatesRoutes } from './start-end-dates/routes'
import { EditAbsenceTypeRoutes } from './absence-type/routes'
import { EditAbsenceSubTypeRoutes } from './absence-subtype/routes'
import { EditReasonCategoryRoutes } from './reason-category/routes'
import { EditAbsenceReasonRoutes } from './reason/routes'
import { EditTapAuthorisationConfirmationRoutes } from './confirmation/routes'

export const EditTapAuthorisationRoutes = (services: Services) => {
  const { router } = BaseRouter()

  router.use('/absence-type', EditAbsenceTypeRoutes(services))
  router.use('/absence-subtype', EditAbsenceSubTypeRoutes(services))
  router.use('/reason-category', EditReasonCategoryRoutes(services))
  router.use('/reason', EditAbsenceReasonRoutes(services))
  router.use('/comments', EditAbsenceCommentsRoutes())
  router.use('/start-end-dates', EditStartEndDatesRoutes(services))
  router.use('/confirmation', EditTapAuthorisationConfirmationRoutes())

  return router
}
