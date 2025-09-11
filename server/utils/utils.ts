const properCase = (word: string): string => (word[0] ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word)

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string | null | undefined): string =>
  !sentence || isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  if (array.length < 1) {
    return null
  }
  const firstName = array[0]
  if (!firstName) {
    return null
  }
  return `${firstName[0]}. ${array.reverse()[0]}`
}

export const getQueryEntries = (query: object | undefined | null, keys: string[]) =>
  query ? Object.entries(query).filter(([key]) => keys.includes(key)) : []

/* eslint-disable no-param-reassign */
export const mergeObjects = <T extends Record<string, unknown>>(destination: T, source: Partial<T>) => {
  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (!destination[key]) {
        // @ts-expect-error set up object for future recursive writes
        destination[key] = {}
      }
      mergeObjects(destination[key] as Record<string, unknown>, value)
    } else {
      // @ts-expect-error unexpected types
      destination[key] = value
    }
  })
}

interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?: Record<string, string>
}

export const addSelectValue = (
  items: SelectOption[] | null,
  text: string,
  show: boolean = true,
  value: string = '',
  selected: boolean = true,
): SelectOption[] | null => {
  if (!items) return null
  const attributes: Record<string, string> = {}
  if (!show) attributes['hidden'] = ''

  return [
    {
      text,
      value,
      selected,
      attributes,
    },
    ...items,
  ]
}

export const setSelectedValue = (items: SelectOption[] | null, selected: string | number): SelectOption[] | null => {
  if (!items) return null
  return items.map(entry => ({ ...entry, selected: entry && entry.value === selected }))
}

export const setCheckedValue = (items: SelectOption[] | null, selected: string | number): SelectOption[] | null => {
  if (!items) return null
  return items.map(entry => ({ ...entry, checked: entry && entry.value === selected }))
}
