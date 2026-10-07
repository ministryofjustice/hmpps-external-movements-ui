import type { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'

export type SwitchOffBanner = {
  html: string
}

export const populateSwitchOffBanner = (_req: Request, res: Response, next: NextFunction) => {
  if (
    ['LEI', 'PNI', 'WWI', 'DMI', 'BAI', 'BZI', 'SUI', 'FBI', 'NMI', 'ACI', 'PBI', 'HPI'].includes(
      res.locals.user.getActiveCaseloadId() ?? '',
    )
  ) {
    const dateString = format(new Date(), 'yyyy-MM-dd')

    if (dateString >= '2026-10-20') {
      res.locals.switchOffBanner = {
        html:
          '<p>Transfers are now available on DPS at your prison. You can:</p>' +
          '<ul class="govuk-list govuk-list--bullet">' +
          '  <li>schedule and manage a transfer</li>' +
          '  <li>plan and manage a transfer</li>' +
          '  <li>schedule transfers in bulk</li>' +
          '  <li>edit scheduled transfers in bulk</li>' +
          '  <li>create and download transfer checklists </li>' +
          '</ul>' +
          '<p>Staff with View only or Management roles assigned by their Local System Administrator (LSA) can access the service. Please request this directly with your LSA. Guidance and access information can be found on our <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/:u:/r/sites/prisons-digital/SitePages/External%20Movements%20-%20Transfers.aspx?d=w56ba4aaa39d0463c92e0ad70a7c22698&csf=1&web=1&e=usHP6E">Transfers SharePoint page</a>. If you have any further questions, please contact us at <a href="mailto:external-movements-rollout@justice.gov.uk">external-movements-rollout@justice.gov.uk</a>.</p>',
      }
    }
  }
  next()
}
