import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { Page } from '../../services/auditService'
import { SearchPrisonerController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const SearchPrisonerRoutes = ({ prisonerSearchService }: Services) => {
  const { router, get } = BaseRouter()

  get(
    '/',
    Page.SEARCH_PRISONER,
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, 'Create a Temporary Absence', {
      label: 'Add temporary absence',
      url: '/add-temporary-absence/start/',
    }).GET,
  )

  get(
    '/tap-documents',
    Page.SEARCH_PRISONER,
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, 'Create and download documents', {
      label: 'Create a document',
      url: '/tap-documents/start/',
    }).GET,
  )

  return router
}
