import { NextFunction, Request, Response } from 'express'
import { HmppsUser } from '../interfaces/hmppsUser'
import config from '../config'

export enum Feature {
  DEV_LED = 'DEV_LED',
}

export const featureEnabled = (user: HmppsUser, feature: Feature) => {
  switch (feature) {
    case Feature.DEV_LED:
      return config.featureToggles.enableDevLedFeatures.includes(user.getActiveCaseloadId() ?? '')
    default:
      return false
  }
}

export const requireFeatureFlag = (feature: Feature) => (_req: Request, res: Response, next: NextFunction) => {
  if (featureEnabled(res.locals.user, feature)) {
    return next()
  }
  return res.notFound()
}
