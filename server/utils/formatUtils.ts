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

export const addressToLines = ({
  flat,
  property,
  street,
  cityDescription,
  countyDescription,
  postcode,
  countryDescription,
}: Address) => {
  let lineOne = [property, street].filter(s => s).join(', ')
  if (flat) {
    lineOne = `${/flat/i.test(flat) ? '' : 'Flat '}${flat}, ${lineOne}`
  }
  const addressArray = [lineOne, cityDescription, countyDescription, postcode, countryDescription].filter(s => s)
  if (addressArray.length) return addressArray.join('\n')
  return ''
}
