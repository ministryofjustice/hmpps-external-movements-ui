import { components } from '../@types/externalMovements'

type DomainEventText = { heading: string; content?: string; reasonRequested?: boolean }

const DOMAIN_EVENT_MAP: { [key: string]: DomainEventText } = {
  'person.temporary-absence-authorisation.approved': {
    heading: 'Absence approved',
    content: 'Temporary absence approved for <prisoner>',
    reasonRequested: true,
  },
  'person.temporary-absence-authorisation.pending': {
    heading: 'Absence created',
    content: 'Temporary absence created for <prisoner>',
  },
  'person.temporary-absence-authorisation.cancelled': {
    heading: 'Absence cancelled',
    content: 'Temporary absence cancelled for <prisoner>',
    reasonRequested: true,
  },
  'person.temporary-absence-authorisation.denied': {
    heading: 'Absence denied',
    content: 'Temporary absence denied for <prisoner>',
    reasonRequested: true,
  },
  'person.temporary-absence-authorisation.date-range-changed': {
    heading: 'Absence date range changed',
  },
  'person.temporary-absence-authorisation.recategorised': {
    heading: 'Absence recategorised',
  },
  'person.temporary-absence-authorisation.comments-changed': {
    heading: 'Absence comments changed',
  },
  'person.temporary-absence-authorisation.accompaniment-changed': {
    heading: 'Absence escort changed',
  },
  'person.temporary-absence-authorisation.transport-changed': {
    heading: 'Absence transport changed',
  },
}

const CHANGE_PROPERTY_MAP: { [key: string]: string } = {
  absenceType: 'Absence type',
  absenceSubType: 'Absence sub-type',
  absenceReasonCategory: 'Absence reason category',
  absenceReason: 'Absence reason',
  start: 'Start date',
  end: 'End date',
  transport: 'Transport',
  location: 'Location',
  accompaniedBy: 'Escort',
  comments: 'Comments',
}

export const parseAuditHistory = (history: components['schemas']['AuditedAction'][]) => {
  const result = history
    .map(action => {
      const eventText = action.domainEvents[0] && DOMAIN_EVENT_MAP[action.domainEvents[0]]
      if (!eventText) return null

      if (!eventText.content) {
        eventText.content = action.changes
          .map(change =>
            change.change
              ? `${CHANGE_PROPERTY_MAP[change.propertyName] ?? change.propertyName} was changed from ${change.previous} to ${change.change}.`
              : `${CHANGE_PROPERTY_MAP[change.propertyName] ?? change.propertyName} ${change.previous} was removed.`,
          )
          .filter(itm => Boolean(itm))
          .join(' ')
      }

      return {
        ...eventText,
        reason: action.reason,
        user: action.user,
        occurredAt: action.occurredAt,
      }
    })
    .filter(itm => Boolean(itm))

  if (result[result.length - 1]?.heading === 'Absence approved') {
    result[result.length - 1]!.heading = 'Absence created'
    result[result.length - 1]!.content = 'Temporary absence created for <prisoner>'
    result[result.length - 1]!.reasonRequested = false
  }

  return result
}
