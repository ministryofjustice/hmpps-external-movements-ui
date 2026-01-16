import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapOccurrencesController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { TapOccurrenceDetailsController } from './details/controller'
import { Page } from '../../services/auditService'

export const BrowseTapOccurrencesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new BrowseTapOccurrencesController(externalMovementsService)

  get(
    '/',
    Page.SEARCH_TEMPORARY_ABSENCE_OCCURRENCES,
    validateOnGET(schema, 'searchTerm', 'start', 'end', 'status', 'page', 'sort'),
    controller.GET,
  )

  get('/:id', Page.VIEW_TEMPORARY_ABSENCE_OCCURRENCE, new TapOccurrenceDetailsController(externalMovementsService).GET)

  return router
}
