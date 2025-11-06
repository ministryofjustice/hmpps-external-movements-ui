import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  HOME_PAGE = 'HOME_PAGE',
  TAP_HOME_PAGE = 'TAP_HOME_PAGE',
  SEARCH_PRISONER = 'SEARCH_PRISONER',
  ADD_TEMPORARY_ABSENCE = 'ADD_TEMPORARY_ABSENCE',
  EDIT_TEMPORARY_ABSENCE = 'EDIT_TEMPORARY_ABSENCE',
  EDIT_TEMPORARY_ABSENCE_AUTHORISATION = 'EDIT_TEMPORARY_ABSENCE_AUTHORISATION',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
  suppress?: boolean
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event, false)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event, false)
  }
}
