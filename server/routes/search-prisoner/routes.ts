import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { Page } from '../../services/auditService'
import { SearchPrisonerController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Feature, requireFeatureFlag } from '../../utils/featureFlag'

export const SearchPrisonerRoutes = ({ prisonerSearchService }: Services) => {
  const { router, get } = BaseRouter()

  get(
    '/',
    Page.SEARCH_PRISONER,
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, {
      caption: 'Create a Temporary Absence',
      action: {
        label: 'Add temporary absence',
        url: '/add-temporary-absence/start/',
      },
    }).GET,
  )

  get(
    '/tap-documents',
    Page.SEARCH_PRISONER,
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, {
      caption: 'Create and download documents',
      action: {
        label: 'Create a document',
        url: '/tap-documents/start/',
      },
    }).GET,
  )

  get(
    '/temporary-absence-schedule-enquiry',
    Page.SEARCH_PRISONER,
    requireFeatureFlag(Feature.DEV_LED),
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, {
      caption: 'View a prisoner’s temporary absences',
      action: {
        label: 'View',
        url: '/temporary-absence-schedule-enquiry/',
      },
    }).GET,
  )

  return router
}
