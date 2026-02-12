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
    skipUser: true,
  },
  'person.temporary-absence.overdue': {
    heading: 'Absence occurrence overdue',
    content: 'Temporary absence occurrence overdue for <prisoner>',
    skipUser: true,
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
  'person.temporary-absence-authorisation.expired': {
    heading: 'Absence expired',
    content: 'Temporary absence expired for <prisoner>',
    skipUser: true,
  },
  'person.temporary-absence.denied': {
    heading: 'Absence occurrence denied',
    content: 'Temporary absence occurrence denied for <prisoner>',
    reasonRequested: true,
  },
  'person.temporary-absence.started': {
    heading: 'Absence occurrence in progress',
    content: 'Temporary absence occurrence in progress for <prisoner>',
  },
  'person.temporary-absence.completed': {
    heading: 'Absence occurrence completed',
    content: 'Temporary absence occurrence completed for <prisoner>',
  },
  'person.temporary-absence-authorisation.deferred': {
    heading: 'Absence deferred',
    content: 'Temporary absence sent back for review for <prisoner>',
  },
  'person.external-movement.migrated': {
    heading: 'Absence movement migrated',
    content: 'Temporary absence movement migrated from NOMIS',
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
  status: 'Status',
}

const OCCURRENCE_CHANGE_PROPERTY_MAP: { [key: string]: string } = {
  start: 'Start date and time',
  end: 'End date and time',
}

const parseChangedPropertyValue = (domain: string, property: string, value: unknown) => {
  if (!value) return 'Not applicable'

  if (domain.endsWith('comments-changed') && property === 'comments') return `“${value}”`

  if (domain.endsWith('date-range-changed') && ['start', 'end'].includes(property)) return formatDate(String(value))

  if (domain.endsWith('rescheduled') && ['start', 'end'].includes(property))
    return formatDate(String(value), `d MMMM yyyy 'at' HH:mm`)

  return String(value)
}

const parsePropertyName = (domain: string, propertyName: string) => {
  if (domain.startsWith('person.temporary-absence.')) {
    return OCCURRENCE_CHANGE_PROPERTY_MAP[propertyName] ?? CHANGE_PROPERTY_MAP[propertyName] ?? propertyName
  }

  return CHANGE_PROPERTY_MAP[propertyName] ?? propertyName
}

const parseTapAuthorisationLocationChange = (action: components['schemas']['AuditedAction']) => {
  const changes = action.changes.find(change => change.propertyName === 'locations')
  const change = (changes?.change ?? []) as string[]
  const previous = (changes?.previous ?? []) as string[]

  let eventText: DomainEventText

  if (change.length === previous.length) {
    eventText = {
      heading: change.length === 1 ? 'Absence location changed' : 'Absence locations changed',
    }
    if (change.length)
      eventText.changes = change.map((val, idx) => `Location was changed from ${previous[idx]} to ${val}.`)
  } else if (change.length > previous.length) {
    const newItems = change.filter(val => !previous.includes(val))
    eventText = {
      heading: newItems.length === 1 ? 'Absence location added' : 'Absence locations added',
    }
    eventText.changes = newItems.map(val => `Location ${val} was added.`)
  } else {
    const deletedItems = previous.filter(val => !change.includes(val))
    eventText = {
      heading: deletedItems.length === 1 ? 'Absence location removed' : 'Absence locations removed',
    }
    eventText.changes = deletedItems.map(val => `Location ${val} was removed.`)
  }

  return {
    ...eventText,
    user: action.user,
    occurredAt: action.occurredAt,
  }
}

export const parseAuditHistory = (history: components['schemas']['AuditedAction'][]) => {
  const result = history
    .flatMap(action =>
      action.domainEvents.map(event => {
        if (event === 'person.temporary-absence-authorisation.relocated') {
          return parseTapAuthorisationLocationChange(action)
        }
        const eventText = DOMAIN_EVENT_MAP[event]
        if (!eventText) return null

        if (!eventText.content) {
          eventText.changes = action.changes
            .map(
              change =>
                `${parsePropertyName(event, change.propertyName)} ${change.propertyName === 'comments' ? 'were' : 'was'} changed from ${parseChangedPropertyValue(event, change.propertyName, change.previous)} to ${parseChangedPropertyValue(event, change.propertyName, change.change)}.`,
            )
            .filter(itm => Boolean(itm))
        }

        return {
          ...eventText,
          reason: action.reason,
          user: eventText.skipUser ? null : action.user,
          occurredAt: action.occurredAt,
        }
      }),
    )
    .filter(itm => Boolean(itm))

  if (result[result.length - 1]?.heading === 'Absence approved') {
    result[result.length - 1]!.heading = 'Absence created'
    result[result.length - 1]!.content = 'Temporary absence created for <prisoner>'
    result[result.length - 1]!.reasonRequested = false
  }

  return result
}
