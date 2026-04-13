import type { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'

export type PhaseBanner = {
  tagText: string
  html: string
}

const defaultBanner: PhaseBanner = {
  tagText: 'Beta',
  html: 'This is a new service - your <a href="mailto:external-movements-rollout@justice.gov.uk">feedback</a> will help us to improve it. You can find out more on <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/sites/prisons-digital/SitePages/External%20Movements%20-%20Homepage.aspx">SharePoint</a>.',
}

export const populatePhaseBanner = (_req: Request, res: Response, next: NextFunction) => {
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
    if (format(new Date(), 'yyyy-MM-dd') < '2026-04-21') {
      res.locals.phaseBanner = {
        tagText: 'Beta',
        html: 'Following the rollout of the temporary absence service on DPS, the corresponding TAP NOMIS screens will be switched off at your prison on 21st April. This means that from this date, you will only be able to use DPS to create and manage temporary absences and generate documents. Staff with View only or Management roles assigned by their Local System Administrator (LSA) can access temporary absences via the external movements tile on the DPS home page. Please contact your LSA if you require access to the new service. Further information and guidance can be found on our <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/sites/prisons-digital/SitePages/External%20Movements%20-%20Homepage.aspx">SharePoint</a> page, but if you have any further questions, please contact us at <a href="mailto:external-movements-rollout@justice.gov.uk">external-movements-rollout@justice.gov.uk</a>.',
      }
    } else {
      res.locals.phaseBanner = {
        tagText: 'Beta',
        html: 'You must now use DPS to create and manage temporary absences and generate documents. The temporary absence screens in NOMIS screens have now been switched off at your prison. Staff with View only or Management roles assigned by their Local System Administrator (LSA) can access temporary absences via the external movements tile on the DPS home page. Please contact your LSA if you require access to the new service. Guidance can be found on our SharePoint page, but if you have any further questions, please contact us at <a href="mailto:external-movements-rollout@justice.gov.uk">external-movements-rollout@justice.gov.uk</a>.',
      }
    }
  } else {
    res.locals.phaseBanner = defaultBanner
  }
  next()
}
