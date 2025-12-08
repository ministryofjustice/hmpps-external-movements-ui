import { RequestHandler } from 'express'

export const permissionsMiddleware: RequestHandler = async (_req, res, next) => {
  if (!res.locals.feComponents?.sharedData?.services.find(({ id }) => id === 'external-movements')) {
    return res.render('pages/service-not-enabled')
  }
  return next()
}
