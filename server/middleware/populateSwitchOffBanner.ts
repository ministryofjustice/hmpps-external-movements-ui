import type { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'

export type SwitchOffBanner = {
  html: string
}

export const populateSwitchOffBanner = (_req: Request, res: Response, next: NextFunction) => {
  if (
    [
      'HVI',
      'TCI',
      'SUI',
      'NSI',
      'FDI',
      'KMI',
      'KVI',
      'LYI',
      'UPI',
      'SPI',
      'GNI',
      'EHI',
      'HDI',
      'ESI',
      'LNI',
      'AGI',
      'HBI',
      'WII',
    ].includes(res.locals.user.getActiveCaseloadId() ?? '')
  ) {
    const dateString = format(new Date(), 'yyyy-MM-dd')

    if (dateString < '2026-04-21') {
      res.locals.switchOffBanner = {
        html: 'Following the rollout of the temporary absence service on DPS, the corresponding TAP NOMIS screens will be switched off at your prison on 21st April. This means that from this date, you will only be able to use DPS to create and manage temporary absences and generate documents. Further information about access and guidance can be found on our <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/sites/prisons-digital/SitePages/External%20Movements%20-%20Homepage.aspx">SharePoint</a> page.',
      }
    } else if (dateString < '2026-05-21') {
      res.locals.switchOffBanner = {
        html: 'You must now use DPS to create and manage temporary absences and generate documents. The temporary absence screens in NOMIS screens have now been switched off at your prison. Staff with View only or Management roles assigned by their Local System Administrator (LSA) can access temporary absences. Guidance can be found on our <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/sites/prisons-digital/SitePages/External%20Movements%20-%20Homepage.aspx">SharePoint</a> page.',
      }
    }
  } else {
    const dateString = format(new Date(), 'yyyy-MM-dd')
    if (dateString >= '2026-04-22' && dateString < '2026-05-12') {
      res.locals.switchOffBanner = {
        html: 'Following the rollout of the temporary absence service on DPS, the corresponding TAP NOMIS screens will be switched off at your prison on Tuesday 12th May. This means that from this date, you will only be able to use DPS to create and manage temporary absences and generate documents. Further information about access and guidance can be found on our <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/sites/prisons-digital/SitePages/External%20Movements%20-%20Homepage.aspx">SharePoint</a> page.',
      }
    } else if (dateString >= '2026-05-12' && dateString < '2026-06-11') {
      res.locals.switchOffBanner = {
        html: 'You must now use DPS to create and manage temporary absences and generate documents. The temporary absence screens in NOMIS screens have now been switched off at your prison. Staff with View only or Management roles assigned by their Local System Administrator (LSA) can access temporary absences. Guidance can be found on our <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/sites/prisons-digital/SitePages/External%20Movements%20-%20Homepage.aspx">SharePoint</a> page.',
      }
    }
  }
  next()
}
