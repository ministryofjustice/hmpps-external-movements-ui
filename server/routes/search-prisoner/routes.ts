import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { Page } from '../../services/auditService'
import { SearchPrisonerController } from './controller'

export const SearchPrisonerRoutes = ({ prisonerSearchService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new SearchPrisonerController(prisonerSearchService)

  get('/', Page.SEARCH_PRISONER, controller.GET)

  return router
}
