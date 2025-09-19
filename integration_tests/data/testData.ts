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
      description: 'Paid work - Agriculture and horticulture',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R12',
      description: 'Paid work - Catering and hospitality',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R14',
      description: 'Paid work - Construction and recycling',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R15',
      description: 'Paid work - IT and communication',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R11',
      description: 'Paid work - Manufacturing',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R10',
      description: 'Paid work - Retail and wholesale',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R13',
      description: 'Paid work - Transportation and storage',
      hintText: null,
      nextDomain: null,
    },
    {
      code: 'R17',
      description: 'Paid work - Other',
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
  'location-type': [
    { code: 'A', description: 'locationType A', hintText: 'Hint text for A' },
    { code: 'B', description: 'locationType B', hintText: 'Hint text for B' },
    { code: 'C', description: 'locationType C', hintText: 'Hint text for C' },
  ],
}
