import { NextFunction, Request, Response } from 'express'
import { HmppsUser, UserPermissionLevel } from '../../interfaces/hmppsUser'

const SERVICE_NAMES = {
  TAP: 'temporary absences',
}

const PERMISSION_MAP = {
  VIEW: UserPermissionLevel.VIEW_ONLY,
  MANAGE: UserPermissionLevel.MANAGE,
}

export const requirePermissions =
  (service: keyof HmppsUser['permissions'], permissionLevel: UserPermissionLevel) =>
  (_req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user.permissions[service] >= permissionLevel) {
      return next()
    }

    return res.render('pages/service-not-authorised', { serviceName: SERVICE_NAMES[service] })
  }

export const hasPermissionFilter = (
  user: HmppsUser,
  service: keyof HmppsUser['permissions'],
  permissionLevel: 'VIEW' | 'MANAGE',
) => user.permissions[service] >= PERMISSION_MAP[permissionLevel]
