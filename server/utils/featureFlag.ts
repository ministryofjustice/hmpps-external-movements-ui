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
