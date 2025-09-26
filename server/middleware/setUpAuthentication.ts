import passport from 'passport'
import flash from 'connect-flash'
import { Router } from 'express'
import { Strategy } from 'passport-oauth2'
import { VerificationClient, AuthenticatedRequest } from '@ministryofjustice/hmpps-auth-clients'
import { getFrontendComponents } from '@ministryofjustice/hmpps-connect-dps-components'
import config from '../config'
import { HmppsUser } from '../interfaces/hmppsUser'
import generateOauthClientToken from '../utils/clientCredentials'
import logger from '../../logger'
import { Services } from '../services'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

passport.use(
  new Strategy(
    {
      authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
      tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      clientID: config.apis.hmppsAuth.authClientId,
      clientSecret: config.apis.hmppsAuth.authClientSecret,
      callbackURL: `${config.ingressUrl}/sign-in/callback`,
      state: process.env.NODE_ENV !== 'e2e-test', // disable state check for Playwright tests
      customHeaders: { Authorization: generateOauthClientToken() },
    },
    (token, _refreshToken, params, _profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    },
  ),
)

export default function setupAuthentication(services: Services) {
  const router = Router()
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get(
    '/autherror',
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
      authenticationClient: services.authenticationClient,
    }),
    (_req, res) => {
      res.status(401)
      return res.render('autherror')
    },
  )

  router.get('/sign-in', passport.authenticate('oauth2'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next),
  )

  const authUrl = config.apis.hmppsAuth.externalUrl
  const authParameters = `client_id=${config.apis.hmppsAuth.authClientId}&redirect_uri=${config.ingressUrl}`

  router.use('/sign-out', (req, res, next) => {
    const authSignOutUrl = `${authUrl}/sign-out?${authParameters}`
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use('/account-details', (_req, res) => {
    res.redirect(`${authUrl}/account-details?${authParameters}`)
  })

  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  router.use((req, res, next) => {
    res.locals.user = req.user as HmppsUser
    res.locals.user.getActiveCaseloadId = () => res.locals.user.activeCaseLoad?.caseLoadId
    next()
  })

  return router
}
