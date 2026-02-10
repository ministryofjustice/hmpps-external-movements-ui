import express, { Request, Response } from 'express'
import { getFrontendComponents, retrieveCaseLoadData } from '@ministryofjustice/hmpps-connect-dps-components'
import * as Sentry from '@sentry/node'
import './sentry'
import config from './config'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import sentryMiddleware from './middleware/sentryMiddleware'

import routes from './routes'
import type { Services } from './services'
import logger from '../logger'
import { auditPageViewMiddleware } from './middleware/audit/auditPageViewMiddleware'
import { auditApiCallMiddleware } from './middleware/audit/auditApiCallMiddleware'
import PrisonerImageRoutes from './routes/prisonerImageRoutes'
import { handleApiError } from './middleware/validation/handleApiError'
import { permissionsMiddleware } from './middleware/permissions/permissionsMiddleware'
import { AuthorisedRoles } from './middleware/permissions/populateUserPermissions'
import { handleJsonErrorResponse, jsonErrorMiddleware } from './middleware/handleJsonErrorResponse'
import { populateEnabledFeatures } from './utils/featureFlag'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(sentryMiddleware())
  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.get('*any', auditPageViewMiddleware(services.auditService))
  app.post('*any', auditApiCallMiddleware(services.auditService))

  app.get(
    '/auth-error',
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    (_req, res) => {
      res.status(401)
      return res.render('autherror')
    },
  )
  app.use(
    authorisationMiddleware([AuthorisedRoles.EXTERNAL_MOVEMENTS_TAP_RO, AuthorisedRoles.EXTERNAL_MOVEMENTS_TAP_RW]),
  )
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())
  app.use(jsonErrorMiddleware)

  app.get('/prisoner-image/:prisonNumber', new PrisonerImageRoutes(services.prisonApiService).GET)

  app.get('/api/addresses/find/:query', async (req: Request<{ query: string }>, res: Response) => {
    try {
      const results = await services.osPlacesAddressService.getAddressesMatchingQuery(req.params.query, {
        osPlacesQueryParamOverrides: { dataset: 'LPI' },
        fuzzyMatchOptionOverrides: {
          shouldSort: true,
          threshold: 0.2,
          useExtendedSearch: true,
          ignoreLocation: true,
          keys: [{ name: 'addressString' }],
        },
      })
      res.json({ status: 200, results })
    } catch (error) {
      res.jsonError(error as { status?: number; message: string })
    }
  })

  app.get(
    /(.*)/,
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
  )

  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    res.notAuthorised = () => res.status(403).render('pages/not-authorised')
    res.conflict = () => res.status(409).render('pages/conflict')
    next()
  })

  app.use(
    retrieveCaseLoadData({
      logger,
      prisonApiConfig: config.apis.prisonApi,
    }),
  )
  app.use(populateEnabledFeatures)

  app.get(/(.*)/, permissionsMiddleware)
  app.use(routes(services))

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, res) => res.notFound())

  // Error handlers must go after `Sentry.setupExpressErrorHandler(app)` for errors to be captured by Sentry
  app.use(handleJsonErrorResponse)
  app.use(handleApiError)
  app.use(errorHandler(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'e2e-test'))

  return app
}
