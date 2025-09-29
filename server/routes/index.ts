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
import { BrowseTapAuthorisationsRoutes } from './temporary-absence-authorisations/routes'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()

  router.use(breadcrumbs())
  router.use(
    historyMiddleware(() => [
      {
        matcher: /^\/$/,
        text: 'Reception and External Movements',
        alias: Page.HOME_PAGE,
      },
      {
        matcher: /temporary-absence-authorisations/,
        text: 'Temporary absence authorisations',
        alias: Page.EXAMPLE_PAGE,
      },
    ]),
  )

  router.use(populateValidationErrors())

  get('*any', (req, res, next) => {
    res.locals['query'] = req.query
    next()
  })

  get('/', Page.HOME_PAGE, async (_req, res) => {
    res.render('view', {
      showBreadcrumbs: true,
      ...(await services.externalMovementsService.getTapOverview({ res })),
    })
  })

  router.use('/search-prisoner', SearchPrisonerRoutes(services))
  router.use('/temporary-absence-authorisations', BrowseTapAuthorisationsRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
