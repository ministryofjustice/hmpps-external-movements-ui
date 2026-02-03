import { v4 as uuidV4 } from 'uuid'
import { components } from '../../server/@types/externalMovements'

const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const randomChar = () => uppercaseChars.charAt(Math.floor(Math.random() * 26))
export const randomPrisonNumber = () =>
  randomChar() + String(Math.random()).substring(2, 6) + randomChar() + randomChar()

export const testPrisonerDetails = {
  prisonerNumber: 'A9965EA',
  bookingId: '1223167',
  bookNumber: '59862A',
  firstName: 'PRISONER-NAME',
  lastName: 'PRISONER-SURNAME',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  youthOffender: false,
  status: 'ACTIVE IN',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  inOutStatus: 'IN',
  prisonId: 'LEI',
  lastPrisonId: 'LEI',
  prisonName: 'Leeds (HMP)',
  cellLocation: '2-1-005',
  aliases: [],
  alerts: [
    {
      alertType: 'L',
      alertCode: 'LCE',
      active: true,
      expired: false,
    },
  ],
  legalStatus: 'REMAND',
  imprisonmentStatus: 'RECEP_REM',
  imprisonmentStatusDescription: 'On remand (reception)',
  convictedStatus: 'Remand',
  recall: false,
  indeterminateSentence: false,
  receptionDate: '2024-11-26',
  locationDescription: 'Leeds (HMP)',
  restrictedPatient: false,
  currentIncentive: {
    level: {
      code: 'STD',
      description: 'Standard',
    },
    dateTime: '2024-11-26T14:12:29',
    nextReviewDate: '2025-02-26',
  },
  addresses: [],
  emailAddresses: [],
  phoneNumbers: [],
  identifiers: [],
  allConvictedOffences: [],
}

export const testAbsenceTypes = {
  domain: { code: 'ABSENCE_TYPE', description: 'Absence type' },
  items: [
    {
      code: 'SR',
      description: 'Standard ROTL (Release on Temporary Licence)',
      hintText: null,
      nextDomain: 'ABSENCE_SUB_TYPE',
    },
    {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
      hintText: null,
      nextDomain: 'ABSENCE_SUB_TYPE',
    },
    {
      code: 'PP',
      description: 'Police production',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'SE',
      description: 'Security escort',
      hintText: null,
      nextDomain: 'ABSENCE_REASON',
    },
    {
      code: 'YT',
      description: 'Youth temporary release',
      hintText: null,
      nextDomain: 'ABSENCE_SUB_TYPE',
    },
  ],
}

export const testAbsenceSubType = {
  domain: { code: 'ABSENCE_SUB_TYPE', description: 'Absence sub type' },
  items: [
    {
      code: 'CRL',
      description: 'CRL (Childcare Resettlement Licence)',
      hintText:
        'To help prisoners prepare for parenting when they are released and support ties between primary carers and their children.',
      nextDomain: null,
    },
    {
      code: 'RDR',
      description: 'RDR (Resettlement Day Release)',
      hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
      nextDomain: 'ABSENCE_REASON_CATEGORY',
    },
    {
      code: 'ROR',
      description: 'ROR (Resettlement Overnight Release)',
      hintText:
        'For prisoners to spend time at their release address to re-establish links with family and the local community.',
      nextDomain: null,
    },
    {
      code: 'SPL',
      description: 'SPL (Special Purpose Licence)',
      hintText:
        'For prisoners to spend time at their release address to re-establish links with family and the local community.',
      nextDomain: 'ABSENCE_REASON',
    },
  ],
}

export const testAbsenceReasonCategory = {
  domain: {
    code: 'ABSENCE_REASON_CATEGORY',
    description: 'Absence reason category',
  },
  items: [
    {
      code: 'FB',
      description: 'Accommodation-related',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'ET',
      description: 'Education or training',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R3',
      description: 'Maintaining family ties',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'PW',
      description: 'Paid work',
      hintText: null,
      nextDomain: 'ABSENCE_REASON',
    },
    {
      code: 'PAP',
      description: 'Prisoner apprenticeships pathway',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'UW',
      description: 'Unpaid work',
      hintText: null,
      nextDomain: 'ABSENCE_REASON',
    },
    {
      code: 'YOTR',
      description: 'Other temporary release linked to sentence or resettlement plan',
      hintText: null,
      nextDomain: null,
    },
  ],
}

export const testWorkReasons = {
  domain: { code: 'ABSENCE_REASON', description: 'Absence reason' },
  items: [
    {
      code: 'R16',
      description: 'Agriculture and horticulture',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R12',
      description: 'Catering and hospitality',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R14',
      description: 'Construction and recycling',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R15',
      description: 'IT and communication',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R11',
      description: 'Manufacturing',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R10',
      description: 'Retail and wholesale',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R13',
      description: 'Transportation and storage',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R17',
      description: 'Other',
      hintText: null,
      nextDomain: null,
    },
  ],
}

export const testOtherReasons = {
  domain: { code: 'ABSENCE_REASON', description: 'Absence reason' },
  items: [
    {
      code: 'LTX',
      description: 'Court, legal, police or prison transfer',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'C3',
      description: 'Death or funeral',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'C6',
      description: 'Inpatient medical or dental appointment',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'C5',
      description: 'Outpatient medical or dental appointment',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'C7',
      description: 'Visit a dying relative',
      hintText: null,
      nextDomain: null,
    },
    {
      code: '4',
      description: 'Other compassionate reason',
      hintText: null,
      nextDomain: null,
    },
  ],
}

export const testRefData = {
  transport: [
    { code: 'AMB', description: 'Ambulance' },
    { code: 'CAR', description: 'Car' },
    { code: 'CAV', description: 'Category A transport' },
    { code: 'COA', description: 'Coach' },
    { code: 'CYCLE', description: 'Bicycle' },
    { code: 'FOOT', description: 'On foot' },
    { code: 'IMM', description: 'Immigration vehicle' },
    { code: 'OD', description: 'Prisoner driver' },
    { code: 'POL', description: 'Police vehicle' },
    { code: 'PUT', description: 'Public transport' },
    { code: 'TAX', description: 'Taxi' },
    { code: 'VAN', description: 'Van' },
  ],
  'accompanied-by': [
    { code: 'A', description: 'accompaniedBy A', hintText: 'Hint text for A' },
    { code: 'B', description: 'accompaniedBy B', hintText: 'Hint text for B' },
    { code: 'C', description: 'accompaniedBy C', hintText: 'Hint text for C' },
  ],
}

export const testTapOccurrenceResult: components['schemas']['TapOccurrenceResult'] = {
  id: 'occurrence-id',
  authorisation: {
    id: uuidV4(),
    person: {
      personIdentifier: 'A9965EA',
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: { code: 'APPROVED', description: 'Approved' },
    absenceType: {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
    },
    absenceSubType: {
      code: 'RDR',
      description: 'RDR (Resettlement Day Release)',
      hintText: 'For prisoners to carry out activities linked to objectives in their sentence plan.',
    },
    absenceReasonCategory: { code: 'PW', description: 'Paid work' },
    absenceReason: { code: 'R15', description: 'IT and communication' },
    repeat: false,
  },
  absenceType: {
    code: 'RR',
    description: 'Restricted ROTL (Release on Temporary Licence)',
  },
  status: { code: 'SCHEDULED', description: 'Scheduled' },
  start: '2001-01-01T10:00:00',
  end: '2001-01-01T17:30:00',
  location: { uprn: 1001, description: 'Random Street, UK' },
  accompaniedBy: { code: 'U', description: 'Unaccompanied' },
  transport: { code: 'CAR', description: 'Car' },
  isCancelled: false,
  absenceCategorisation:
    'Restricted ROTL (Release on Temporary Licence) > RDR (Resettlement Day Release) > Paid work > IT and communication',
}

export const testTapOccurrence: components['schemas']['TapOccurrence'] = {
  id: 'occurrence-id',
  authorisation: {
    id: uuidV4(),
    person: {
      personIdentifier: 'A9965EA',
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: { code: 'APPROVED', description: 'Approved' },
    absenceType: {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
    },
    repeat: false,
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
  },
  occurrencePosition: 1,
  totalOccurrences: 1,
  status: { code: 'SCHEDULED', description: 'Scheduled' },
  start: '2001-01-01T10:00:00',
  end: '2001-01-01T17:30:00',
  location: { uprn: 1001, description: 'Random Street, UK' },
  accompaniedBy: { code: 'U', description: 'Unaccompanied' },
  transport: { code: 'CAR', description: 'Car' },
  movements: [],
}

export const testTapAuthorisation: components['schemas']['TapAuthorisation'] = {
  id: 'authorisation-id',
  person: {
    personIdentifier: 'A9965EA',
    firstName: 'PRISONER-NAME',
    lastName: 'PRISONER-SURNAME',
    dateOfBirth: '1990-01-01',
    cellLocation: '2-1-005',
  },
  status: { code: 'PENDING', description: 'To be reviewed' },
  absenceType: { code: 'PP', description: 'Police production' },
  repeat: false,
  totalOccurrenceCount: 1,
  start: '2001-01-01',
  end: '2001-01-01',
  accompaniedBy: { code: 'U', description: 'Unaccompanied' },
  transport: { code: 'CAR', description: 'Car' },
  locations: [{ uprn: 1001, description: 'Random Street, UK' }],
  occurrences: [
    {
      id: 'occurrence-id',
      absenceType: { code: 'PP', description: 'Police production' },
      start: '2001-01-01T10:00:00',
      end: '2001-01-01T17:30:00',
      status: { code: 'PENDING', description: 'To be reviewed' },
    },
  ],
}

export const testSearchAddressResults = [
  {
    addressString: 'Address',
    buildingName: '',
    subBuildingName: '',
    thoroughfareName: 'Random Street',
    dependentLocality: '',
    postTown: '',
    county: '',
    postcode: 'RS1 34T',
    country: 'E',
    uprn: 1001,
  },
  {
    addressString: 'Address 2',
    buildingName: '',
    subBuildingName: '',
    thoroughfareName: 'Random Street',
    dependentLocality: '',
    postTown: '',
    county: '',
    postcode: 'RS1 34T',
    country: 'E',
    uprn: 1002,
  },
  {
    addressString: 'Address 3',
    buildingName: '',
    subBuildingName: '',
    thoroughfareName: 'Random Street',
    dependentLocality: '',
    postTown: '',
    county: '',
    postcode: 'RS1 34T',
    country: 'E',
    uprn: 1003,
  },
]
