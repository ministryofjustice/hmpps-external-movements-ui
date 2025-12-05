import { components } from '../@types/externalMovements'
import { Address } from '../@types/journeys'

const uniformWhitespace = (word: string): string => (word ? word.trim().replace(/\s+/g, ' ') : '')

const isLowerCase = (val: string): boolean => /^[a-z]*$/.test(val)

const lowercaseExceptAcronym = (val: string): string => {
  if (val.includes('-')) {
    return val
      .split('-')
      .map(part => (Array.from(part).some(isLowerCase) ? part.toLowerCase() : part))
      .join('-')
  }

  if (val.length < 2 || Array.from(val).some(isLowerCase)) {
    return val.toLowerCase()
  }
  return val
}

export const sentenceCase = (val: string, startsWithUppercase: boolean = true): string => {
  const words = val.split(/\s+/)
  const sentence = words.map(lowercaseExceptAcronym).join(' ')
  return startsWithUppercase ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence
}

const titleCase = (val: string) => {
  const words = val.split(/\s+/)
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export const nameCase = (name: string): string => {
  const uniformWhitespaceName = uniformWhitespace(name)
  return uniformWhitespaceName
    .split(' ')
    .map(s =>
      s.includes('-')
        ? s
            .split('-')
            .map(val => titleCase(val))
            .join('-')
        : titleCase(s),
    )
    .join(' ')
}

export const lastNameCommaFirstName = (person: { firstName: string; lastName: string }): string => {
  if (!person) return ''
  return `${nameCase(person.lastName)}, ${nameCase(person.firstName)}`.replace(/(^, )|(, $)/, '')
}

export const firstNameSpaceLastName = (person: { firstName: string; lastName: string }): string => {
  if (!person) return ''
  return `${nameCase(person.firstName)} ${nameCase(person.lastName)}`.trim()
}

export const possessiveComma = (name: string) => (name.endsWith('s') ? `${name}’` : `${name}’s`)

export const formatRefDataName = (val: string) => {
  const [firstWord, ...otherWords] = val.split(/\s+/)
  return [lowercaseExceptAcronym(firstWord ?? ''), ...otherWords].join(' ')
}

const STATUS_PRIORITY_MAP: { [key: string]: number } = {
  PENDING: 0,
  APPROVED: 10,
  IN_PROGRESS: 15,
  DENIED: 20,
  OVERDUE: 25,
  EXPIRED: 27,
  WITHDRAWN: 30,
  SCHEDULED: 40,
  CANCELLED: 50,
  COMPLETED: 60,
}

export const statusPriority = (statusCode: string) => STATUS_PRIORITY_MAP[statusCode] ?? 999

export const occurrenceStatus = (occurrence: components['schemas']['TapOccurrenceResult']) => {
  if (occurrence.isCancelled) {
    return {
      code: 'CANCELLED',
      description: 'Cancelled',
    }
  }

  if (occurrence.authorisation.status.code === 'APPROVED') {
    return {
      code: 'SCHEDULED',
      description: 'Scheduled',
    }
  }

  return occurrence.authorisation.status
}

/**
 * Converts an unformatted name string to the format, 'J. Bloggs'.
 * Specifically, this method initialises the first name and appends it by the last name. Any middle names are stripped.
 * @param fullName name to be converted.
 * @returns name converted to initialised format.
 */
export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0]?.[0]}. ${array.reverse()[0]}`
}

export const joinAddress = ({ line1, line2, city, county, postcode, address, description }: Address) => {
  if (address) return address
  return (
    [description, line1, line2, city, county].filter(itm => !!itm?.trim()).join(', ') + (postcode ? ` ${postcode}` : '')
  )
}

export const trimAddress = ({ line1, line2, city, county, postcode, address, description }: Address) => {
  if (address) {
    let result = postcode ? address.replace(`, ${postcode}`, '') : address
    if (description) result = result.replace(`${description}, `, '')
    return result
  }
  return [line1, line2, city, county].filter(itm => !!itm?.trim()).join(', ')
}

export const formatAddress = ({
  description,
  address,
  postcode,
}: {
  description: string
  address: string
  postcode: string
  uprn: number
}) => [description, address, postcode].filter(itm => !!itm?.trim()).join(', ')
