import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { Page } from '../../services/auditService'
import { TapMovementDetailsController } from './details/controller'

export const BrowseTapMovementsRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()

  get('/:id', Page.VIEW_TEMPORARY_ABSENCE_MOVEMENT, new TapMovementDetailsController(externalMovementsService).GET)

  return router
}
