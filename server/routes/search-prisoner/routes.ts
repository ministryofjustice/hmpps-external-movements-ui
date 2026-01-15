import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { Page } from '../../services/auditService'
import { SearchPrisonerController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const SearchPrisonerRoutes = ({ prisonerSearchService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new SearchPrisonerController(prisonerSearchService)

  get('/', Page.SEARCH_PRISONER, validateOnGET(schema, 'searchTerm'), controller.GET)

  return router
}
