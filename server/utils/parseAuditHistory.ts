import { components } from '../@types/externalMovements'
import { formatDate } from './dateTimeUtils'

type DomainEventText = {
  heading: string
  content?: string
  reasonRequested?: boolean
  changes?: string[]
  skipUser?: boolean
}

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
    heading: 'Absence accompaniment changed',
  },
  'person.temporary-absence-authorisation.transport-changed': {
    heading: 'Absence transport changed',
  },
  'person.temporary-absence.scheduled': {
    heading: 'Absence occurrence created',
    content: 'Temporary absence occurrence created for <prisoner>',
  },
  'person.temporary-absence.cancelled': {
    heading: 'Absence occurrence cancelled',
    content: 'Temporary absence occurrence cancelled for <prisoner>',
    reasonRequested: true,
  },
  'person.temporary-absence.expired': {
    heading: 'Absence occurrence expired',
    content: 'Temporary absence occurrence expired for <prisoner>',
  },
  'person.temporary-absence.overdue': {
    heading: 'Absence occurrence overdue',
    content: 'Temporary absence occurrence overdue for <prisoner>',
  },
  'person.temporary-absence.contact-information-changed': {
    heading: 'Absence occurrence contact information changed',
  },
  'person.temporary-absence.rescheduled': {
    heading: 'Absence occurrence rescheduled',
  },
  'person.temporary-absence.comments-changed': {
    heading: 'Absence occurrence comments changed',
  },
  'person.temporary-absence.accompaniment-changed': {
    heading: 'Absence occurrence accompaniment changed',
  },
  'person.temporary-absence.transport-changed': {
    heading: 'Absence occurrence transport changed',
  },
  'person.temporary-absence.recategorised': {
    heading: 'Absence occurrence categorisation changed',
  },
  'person.temporary-absence.relocated': {
    heading: 'Absence occurrence location changed',
  },
  'person.temporary-absence-authorisation.migrated': {
    heading: 'Absence migrated',
    content: 'Temporary absence migrated from NOMIS',
    skipUser: true,
  },
  'person.temporary-absence.migrated': {
    heading: 'Absence occurrence migrated',
    content: 'Temporary absence occurrence migrated from NOMIS',
    skipUser: true,
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

const OCCURRENCE_CHANGE_PROPERTY_MAP: { [key: string]: string } = {
  start: 'Start date and time',
  end: 'End date and time',
}

const parseChangedPropertyValue = (domain: string, value: unknown) => {
  if (!value) return 'Not applicable'

  if (domain.endsWith('comments-changed')) return `“${value}”`

  if (domain.endsWith('date-range-changed')) return formatDate(String(value))

  if (domain.endsWith('rescheduled')) return formatDate(String(value), `d MMMM yyyy 'at' HH:mm`)

  return String(value)
}

const parsePropertyName = (domain: string, propertyName: string) => {
  if (domain.startsWith('person.temporary-absence.')) {
    return OCCURRENCE_CHANGE_PROPERTY_MAP[propertyName] ?? CHANGE_PROPERTY_MAP[propertyName] ?? propertyName
  }

  return CHANGE_PROPERTY_MAP[propertyName] ?? propertyName
}

export const parseAuditHistory = (history: components['schemas']['AuditedAction'][]) => {
  const result = history
    .map(action => {
      const eventText = action.domainEvents[0] && DOMAIN_EVENT_MAP[action.domainEvents[0]]
      if (!eventText) return null

      if (!eventText.content) {
        eventText.changes = action.changes
          .map(
            change =>
              `${parsePropertyName(action.domainEvents[0]!, change.propertyName)} was changed from ${parseChangedPropertyValue(action.domainEvents[0]!, change.previous)} to ${parseChangedPropertyValue(action.domainEvents[0]!, change.change)}.`,
          )
          .filter(itm => Boolean(itm))
      }

      return {
        ...eventText,
        reason: action.reason,
        user: eventText.skipUser ? null : action.user,
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
