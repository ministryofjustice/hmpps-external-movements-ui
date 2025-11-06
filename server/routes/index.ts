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
import { BrowseTapOccurrencesRoutes } from './temporary-absences/routes'
import { FLASH_KEY__SUCCESS_BANNER } from '../utils/constants'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()

  router.use(breadcrumbs())
  router.use(
    historyMiddleware(() => [
      {
        matcher: /^\/$/,
        text: 'External Movements',
        alias: Page.HOME_PAGE,
      },
      {
        matcher: /^\/temporary-absences-home$/,
        text: 'Temporary absences',
        alias: Page.TAP_HOME_PAGE,
      },
      {
        matcher: /search-prisoner/,
        text: 'Search prisoner',
        alias: Page.SEARCH_PRISONER,
      },
      {
        matcher: /temporary-absence-authorisations$/,
        text: 'Browse absence authorisations',
        alias: 'temp-page-1',
      },
      {
        matcher: /temporary-absence-authorisations\/(\w|-)+$/,
        text: 'Temporary absence',
        alias: 'temp-page-2',
      },
      {
        matcher: /temporary-absence-authorisations\/(\w|-)+\/occurrence\/(\w|-)+$/,
        text: 'Temporary absence',
        alias: 'temp-page-3',
      },
      {
        matcher: /temporary-absences$/,
        text: 'Browse temporary absences',
        alias: 'temp-page-3',
      },
    ]),
  )

  router.use(populateValidationErrors())

  get('*any', (req, res, next) => {
    res.locals['query'] = req.query
    const successBanner = req.flash(FLASH_KEY__SUCCESS_BANNER)
    res.locals['successBanner'] = successBanner?.[0] ? successBanner[0] : undefined
    next()
  })

  get('/', Page.HOME_PAGE, async (_req, res) => {
    res.render('view', {
      showBreadcrumbs: true,
    })
  })

  get('/temporary-absences-home', Page.TAP_HOME_PAGE, async (_req, res) => {
    res.render('view-tap', {
      showBreadcrumbs: true,
      ...(await services.externalMovementsService.getTapOverview({ res })),
    })
  })

  router.use('/search-prisoner', SearchPrisonerRoutes(services))
  router.use('/temporary-absence-authorisations', BrowseTapAuthorisationsRoutes(services))
  router.use('/temporary-absences', BrowseTapOccurrencesRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
