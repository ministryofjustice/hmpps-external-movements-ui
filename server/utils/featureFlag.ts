import { HmppsUser } from '../interfaces/hmppsUser'
import config from '../config'

export enum Feature {
  RECORDED_MOVEMENTS = 'RECORDED_MOVEMENTS',
}

export const featureEnabled = (user: HmppsUser, feature: Feature) => {
  switch (feature) {
    case Feature.RECORDED_MOVEMENTS:
      return config.featureToggles.enableRecordedMovements.includes(user.getActiveCaseloadId() ?? '')
    default:
      return false
  }
}
