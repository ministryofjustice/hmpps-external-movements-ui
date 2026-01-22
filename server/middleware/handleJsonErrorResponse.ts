import type { HTTPError } from 'superagent'
import { NextFunction, Request, Response } from 'express'

// errors are thrown to next so that they can be captured by Sentry before getting handled by `handleJsonErrorResponse`
export const jsonErrorMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.jsonError = error => {
    const status: number = 'status' in error && typeof error.status === 'number' ? error.status : 500
    res.locals.jsonError = { status, error: error.message }
    next(error)
  }
  next()
}

export const handleJsonErrorResponse = (error: HTTPError, _req: Request, res: Response, next: NextFunction) => {
  if (res.locals.jsonError) {
    res.status(res.locals.jsonError.status).json(res.locals.jsonError)
  } else {
    next(error)
  }
}
