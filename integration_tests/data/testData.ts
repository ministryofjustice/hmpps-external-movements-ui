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
