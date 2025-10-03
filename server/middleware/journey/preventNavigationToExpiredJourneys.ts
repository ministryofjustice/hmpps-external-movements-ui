import type { NextFunction, Request, Response } from 'express'
import { getLastNonJourneyPage } from '../history/historyMiddleware'

export default function preventNavigationToExpiredJourneys() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.journeyData?.journeyCompleted && !req.originalUrl?.match(/\/confirmation(\/?$|\?)/)) {
      const url = getLastNonJourneyPage(res, `/`)
      return res.redirect(url)
    }

    return next()
  }
}
