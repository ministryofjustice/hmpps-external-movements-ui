import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
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
import { CreateDocumentsRoutes } from './create-documents/routes'
import { Feature, requireFeatureFlag } from '../utils/featureFlag'
import { TemporaryAbsenceScheduleEnquiryRoutes } from './temporary-absence-schedule-enquiry/routes'

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
        alias: Page.SEARCH_TEMPORARY_ABSENCE_AUTHORISATIONS,
      },
      {
        matcher: /temporary-absence-authorisations\/(\w|-)+$/,
        text: 'Absence plan',
        alias: Page.VIEW_TEMPORARY_ABSENCE_AUTHORISATION,
      },
      {
        matcher: /temporary-absences$/,
        text: 'Browse absence occurrences',
        alias: Page.SEARCH_TEMPORARY_ABSENCE_OCCURRENCES,
      },
      {
        matcher: /temporary-absences\/(\w|-)+$/,
        text: 'Absence occurrence',
        alias: Page.VIEW_TEMPORARY_ABSENCE_OCCURRENCE,
      },
      {
        matcher: /temporary-absence-schedule-enquiry\/[\w\d]+$/,
        text: 'Temporary absence schedule enquiry',
        alias: Page.TEMPORARY_ABSENCE_SCHEDULE_ENQUIRY,
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
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    BrowseTapMovementsRoutes(services),
  )
  router.use(
    '/create-documents',
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    requireFeatureFlag(Feature.DOC_GEN),
    CreateDocumentsRoutes(services),
  )
  router.use(
    '/temporary-absence-schedule-enquiry/:prisonNumber',
    requirePermissions('TAP', UserPermissionLevel.VIEW_ONLY),
    requireFeatureFlag(Feature.DEV_LED),
    prisonerPermissionsGuard(services.prisonPermissionsService, {
      requestDependentOn: [PrisonerBasePermission.read],
      getPrisonerNumberFunction: req => req.params['prisonNumber'] as string,
    }),
    TemporaryAbsenceScheduleEnquiryRoutes(services),
  )

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
