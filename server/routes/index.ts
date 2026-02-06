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
import { populateUserPermissions } from '../middleware/permissions/populateUserPermissions'
import { requirePermissions } from '../middleware/permissions/requirePermissions'
import { UserPermissionLevel } from '../interfaces/hmppsUser'
import { BrowseTapMovementsRoutes } from './temporary-absence-movements/routes'
import { Feature, requireFeatureFlag } from '../utils/featureFlag'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()

  router.use(populateUserPermissions)
  router.use(breadcrumbs())
  router.use(
    historyMiddleware(() => [
      {
        matcher: /^\/$/,
        text: 'External movements',
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
        text: 'Browse absence plans',
        alias: 'temp-page-1',
      },
      {
        matcher: /temporary-absence-authorisations\/(\w|-)+$/,
        text: 'Absence plan',
        alias: 'temp-page-2',
      },
      {
        matcher: /temporary-absences$/,
        text: 'Browse absence occurrences',
        alias: 'temp-page-3',
      },
      {
        matcher: /temporary-absences\/(\w|-)+$/,
        text: 'Absence occurrence',
        alias: 'temp-page-4',
      },
    ]),
  )

  router.use(populateValidationErrors())

  get('*any', (req, res, next) => {
    res.locals['originalUrl'] = req.originalUrl // for use by prisoner profile backlink
    res.locals['query'] = req.query // for use by getQueryEntries nunjucks filter
    const successBanner = req.flash(FLASH_KEY__SUCCESS_BANNER)
    res.locals['successBanner'] = successBanner?.[0] ? successBanner[0] : undefined
    next()
  })

  get('/', Page.HOME_PAGE, async (_req, res) => {
    res.render('view', {
      showBreadcrumbs: true,
    })
  })

  get(
    '/temporary-absences-home',
    Page.TAP_HOME_PAGE,
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    async (_req, res) => {
      res.render('view-tap', {
        showBreadcrumbs: true,
        ...(await services.externalMovementsService.getTapOverview({ res })),
      })
    },
  )

  router.use('/search-prisoner', requirePermissions('TAP', UserPermissionLevel.MANAGE), SearchPrisonerRoutes(services))
  router.use(
    '/temporary-absence-authorisations',
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    BrowseTapAuthorisationsRoutes(services),
  )
  router.use(
    '/temporary-absences',
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    BrowseTapOccurrencesRoutes(services),
  )
  router.use(
    '/temporary-absence-movements',
    requireFeatureFlag(Feature.DEV_LED),
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    BrowseTapMovementsRoutes(services),
  )

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
