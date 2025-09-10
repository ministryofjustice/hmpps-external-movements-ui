import { Router } from 'express'
import { Services } from '../services'
import { Page } from '../services/auditService'
import breadcrumbs from '../middleware/history/breadcrumbs'
import { BaseRouter } from './common/routes'
import { SearchPrisonerRoutes } from './search-prisoner/routes'
import { historyMiddleware } from '../middleware/history/historyMiddleware'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import { JourneyRoutes } from './journeys/routes'
import populateValidationErrors from '../middleware/validation/populateValidationErrors'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()

  router.use(breadcrumbs())
  const uuidMatcher = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  router.use(historyMiddleware(uuidMatcher))

  router.use(populateValidationErrors())

  get('*any', (req, res, next) => {
    res.locals['query'] = req.query
    next()
  })

  get('/', Page.HOME_PAGE, async (_req, res) => {
    res.render('view', { showBreadcrumbs: true })
  })

  router.use('/search-prisoner', SearchPrisonerRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
