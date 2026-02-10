import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapAuthorisationsController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { TapAuthorisationDetailsController } from './details/controller'
import { schema as detailsSchema } from './details/schema'
import { Page } from '../../services/auditService'

export const BrowseTapAuthorisationsRoutes = (services: Services) => {
  const { externalMovementsService, prisonerSearchService } = services
  const { router, get } = BaseRouter()
  const controller = new BrowseTapAuthorisationsController(externalMovementsService)

  get(
    '/',
    Page.SEARCH_TEMPORARY_ABSENCE_AUTHORISATIONS,
    validateOnGET(
      schema,
      'searchTerm',
      'start',
      'end',
      'status',
      'page',
      'sort',
      'type',
      'subType',
      'reason',
      'workType',
    ),
    controller.GET,
  )
  get(
    '/:id',
    Page.VIEW_TEMPORARY_ABSENCE_AUTHORISATION,
    validateOnGET(detailsSchema, 'dateFrom', 'dateTo'),
    new TapAuthorisationDetailsController(externalMovementsService, prisonerSearchService).GET,
  )

  return router
}
