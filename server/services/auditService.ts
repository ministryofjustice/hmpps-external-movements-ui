import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  HOME_PAGE = 'HOME_PAGE',
  TAP_HOME_PAGE = 'TAP_HOME_PAGE',
  SEARCH_PRISONER = 'SEARCH_PRISONER',
  ADD_TEMPORARY_ABSENCE = 'ADD_TEMPORARY_ABSENCE',
  ADD_TEMPORARY_ABSENCE_OCCURRENCE = 'ADD_TEMPORARY_ABSENCE_OCCURRENCE',
  EDIT_TEMPORARY_ABSENCE_OCCURRENCE = 'EDIT_TEMPORARY_ABSENCE_OCCURRENCE',
  EDIT_TEMPORARY_ABSENCE_AUTHORISATION = 'EDIT_TEMPORARY_ABSENCE_AUTHORISATION',
  SEARCH_TEMPORARY_ABSENCE_AUTHORISATIONS = 'SEARCH_TEMPORARY_ABSENCE_AUTHORISATIONS',
  SEARCH_TEMPORARY_ABSENCE_OCCURRENCES = 'SEARCH_TEMPORARY_ABSENCE_OCCURRENCES',
  VIEW_TEMPORARY_ABSENCE_AUTHORISATION = 'VIEW_TEMPORARY_ABSENCE_AUTHORISATION',
  VIEW_TEMPORARY_ABSENCE_OCCURRENCE = 'VIEW_TEMPORARY_ABSENCE_OCCURRENCE',
  VIEW_TEMPORARY_ABSENCE_MOVEMENT = 'VIEW_TEMPORARY_ABSENCE_MOVEMENT',
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
