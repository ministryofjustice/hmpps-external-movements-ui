import { addDays, format, subDays } from 'date-fns'
import {
  convertToTitleCase,
  initialiseName,
  isPrisonNumber,
  isTapAuthorisationEditable,
  isTapOccurrenceEditable,
} from './utils'
import { components } from '../@types/externalMovements'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_, a, expected) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [undefined, undefined, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_, a, expected) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('isTapAuthorisationEditable', () => {
  it('returns true if TAP authorisation is in applicable status', () => {
    expect(
      isTapAuthorisationEditable({
        status: { code: 'APPROVED' },
        occurrences: [{} as components['schemas']['TapAuthorisation.Occurrence']],
        end: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        repeat: true,
      }),
    ).toBeTruthy()
  })

  it('returns true if TAP authorisation is in non-applicable status', () => {
    expect(
      isTapAuthorisationEditable({
        status: { code: 'DENIED' },
        occurrences: [{} as components['schemas']['TapAuthorisation.Occurrence']],
        end: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        repeat: true,
      }),
    ).toBeFalsy()
  })

  it('returns true if TAP authorisation is in the past', () => {
    expect(
      isTapAuthorisationEditable({
        status: { code: 'APPROVED' },
        occurrences: [{} as components['schemas']['TapAuthorisation.Occurrence']],
        end: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        repeat: true,
      }),
    ).toBeFalsy()
  })

  it('returns true if repeating TAP authorisation does not have an occurrence', () => {
    expect(
      isTapAuthorisationEditable({
        status: { code: 'APPROVED' },
        occurrences: [],
        end: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        repeat: true,
      }),
    ).toBeTruthy()
  })

  it('returns false if single TAP authorisation does not have an occurrence', () => {
    expect(
      isTapAuthorisationEditable({
        status: { code: 'APPROVED' },
        occurrences: [],
        end: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        repeat: false,
      }),
    ).toBeFalsy()
  })
})

describe('isTapOccurrenceEditable', () => {
  it('returns true if TAP occurrence is in applicable status', () => {
    expect(isTapOccurrenceEditable({ status: { code: 'SCHEDULED' } })).toBeTruthy()
  })

  it('returns true if TAP occurrence is in non-applicable status', () => {
    expect(isTapOccurrenceEditable({ status: { code: 'OVERDUE' } })).toBeFalsy()
  })
})

describe('isPrisonNumber', () => {
  it('returns true if value is in the correct format of a prison number', () => {
    expect(isPrisonNumber('A1234BB', false)).toBeTruthy()
  })

  it('returns true allowing preceding and trailing whitespaces', () => {
    expect(isPrisonNumber('  A1234BB  ', true)).toBeTruthy()
  })

  it('returns false not allowing preceding and trailing whitespaces', () => {
    expect(isPrisonNumber('  A1234BB  ', false)).toBeFalsy()
  })

  it('returns false if value contains extra characters', () => {
    expect(isPrisonNumber('A1234EXTRA', true)).toBeFalsy()
  })
})
