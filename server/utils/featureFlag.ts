import { NextFunction, Request, Response } from 'express'
import { HmppsUser } from '../interfaces/hmppsUser'
import config from '../config'

export enum Feature {
  DEV_LED = 'DEV_LED',
  INTRA_DAY = 'INTRA_DAY',
}

export const featureEnabled = (user: HmppsUser, feature: Feature) => {
  switch (feature) {
    case Feature.DEV_LED:
      return config.featureToggles.enableDevLedFeatures.includes(user.getActiveCaseloadId() ?? '')
    case Feature.INTRA_DAY:
      return config.featureToggles.enableIntraDayScheduling.includes(user.getActiveCaseloadId() ?? '')
    default:
      return false
  }
}

export const requireFeatureFlag = (feature: Feature) => (req: Request, res: Response, next: NextFunction) => {
  if (req.middleware?.enabledFeatures?.includes(feature)) {
    return next()
  }
  return res.notFound()
}

export const populateEnabledFeatures = (req: Request, res: Response, next: NextFunction) => {
  const features: Feature[] = []

  if (featureEnabled(res.locals.user, Feature.DEV_LED)) features.push(Feature.DEV_LED)
  if (featureEnabled(res.locals.user, Feature.INTRA_DAY)) features.push(Feature.INTRA_DAY)

  req.middleware ??= {}
  req.middleware.enabledFeatures = features
  next()
}
