import { components } from '../externalMovements'

export interface PrisonerDetails {
  prisonerNumber: string
  lastName: string
  firstName: string
  dateOfBirth: string
  prisonName?: string | undefined
  cellLocation?: string | undefined
}

export type Address = {
  id?: string | null
  description?: string | null
  flat?: string | null
  property?: string | null
  street?: string | null
  area?: string | null
  cityDescription?: string | null
  countyDescription?: string | null
  postcode?: string | null
  countryDescription?: string | null
}

export type JourneyData = {
  instanceUnixEpoch: number
  prisonerDetails?: PrisonerDetails
  addTemporaryAbsence?: AddTemporaryAbsenceJourney
  updateTapOccurrence?: UpdateTapOccurrenceJourney
  updateTapAuthorisation?: UpdateTapAuthorisationJourney
  isCheckAnswers?: boolean
  journeyCompleted?: boolean
  b64History?: string | undefined
  stateGuard?: boolean
}

export type AddTemporaryAbsenceJourney = Partial<{
  categorySubJourney: Partial<{
    absenceType: components['schemas']['AbsenceCategorisation']
    absenceSubType: components['schemas']['AbsenceCategorisation']
    reasonCategory: components['schemas']['AbsenceCategorisation']
    reason: components['schemas']['AbsenceCategorisation']
  }>
  absenceType: components['schemas']['AbsenceCategorisation']
  absenceSubType: components['schemas']['AbsenceCategorisation']
  reasonCategory: components['schemas']['AbsenceCategorisation']
  reason: components['schemas']['AbsenceCategorisation']
  repeat: boolean
  startDateTimeSubJourney: {
    startDate: string
    startTime: string
  }
  startDate: string
  startTime: string
  returnDate: string
  returnTime: string
  confirmLocationSubJourney: {
    location: Address
  }
  location: Address
  accompaniedSubJourney: {
    accompanied: boolean
  }
  accompanied: boolean
  accompaniedBy: components['schemas']['CodedDescription']
  transport: components['schemas']['CodedDescription']
  notes: string | null
  requireApproval: boolean
  fromDate: string
  toDate: string
  patternType: 'FREEFORM' | 'WEEKLY' | 'ROTATING'
  freeFormPattern: {
    startDate: string
    startTime: string
    returnDate: string
    returnTime: string
    locationId?: string
  }[]
  weeklyPattern: {
    day: number
    overnight: boolean
    startTime: string
    returnTime: string
    locationId?: string
  }[]
  rotatingPatternSubJourney: {
    intervals: {
      type: string
      count: number
      items?: {
        startTime: string
        returnTime: string
        locationId?: string
      }[]
    }[]
    isSameTime?: boolean
  }
  rotatingPattern: {
    intervals: {
      type: string
      count: number
      items: {
        startTime: string
        returnTime: string
        locationId?: string
      }[]
    }[]
    isSameTime: boolean
  }
  isCheckPattern: boolean
}>

export type UpdateTapOccurrenceJourney = {
  occurrence: components['schemas']['TapOccurrence']
  authorisation: components['schemas']['TapAuthorisation']
} & Partial<{
  changeType: 'start-date' | 'end-date' | 'transport' | 'location' | 'notes'
  startDate: string
  startTime: string
  returnDate: string
  returnTime: string
  location: Address
  transport: components['schemas']['CodedDescription']
  notes: string
}>

export type UpdateTapAuthorisationJourney = {
  authorisation: components['schemas']['TapAuthorisation']
} & Partial<{
  absenceType: components['schemas']['AbsenceCategorisation']
  absenceSubType: components['schemas']['AbsenceCategorisation']
  reasonCategory: components['schemas']['AbsenceCategorisation']
  reason: components['schemas']['AbsenceCategorisation']
}>
