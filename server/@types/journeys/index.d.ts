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
  line1?: string | null
  line2?: string | null
  city?: string | null
  county?: string | null
  postcode?: string | null
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
  locations: Address[]
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
  patternType: 'FREEFORM' | 'WEEKLY' | 'ROTATING' | 'SHIFT' | 'BIWEEKLY'
  freeFormPattern: {
    startDate: string
    startTime: string
    returnDate: string
    returnTime: string
  }[]
  weeklyPattern: DayOfWeekTimeSlot[]
  rotatingPatternSubJourney: {
    intervals: RotatingPatternInterval[]
    isSameTime?: boolean
  }
  rotatingPattern: {
    intervals: RotatingPatternInterval[]
    isSameTime: boolean
  }
  shiftPattern: ShiftPatternInterval[]
  biweeklyPattern: {
    weekA: DayOfWeekTimeSlot[]
    weekB: DayOfWeekTimeSlot[]
  }
  isCheckPattern: boolean
  occurrencesToMatch: {
    releaseAt: string
    returnBy: string
    locationIdx?: number
  }[]
  occurrences: {
    releaseAt: string
    returnBy: string
    locationIdx: number
  }[]
}>

export type RotatingPatternInterval = {
  type: string
  count: number
  items?: {
    startTime: string
    returnTime: string
  }[]
}

export type ShiftPatternInterval =
  | {
      type: 'DAY' | 'NIGHT'
      count: number
      startTime: string
      returnTime: string
    }
  | {
      type: 'REST'
      count: number
      startTime?: undefined
      returnTime?: undefined
    }

export type DayOfWeekTimeSlot = {
  day: number
  overnight: boolean
  startTime: string
  returnTime: string
}

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
  backUrl: string
  absenceType: components['schemas']['AbsenceCategorisation']
  absenceSubType: components['schemas']['AbsenceCategorisation']
  reasonCategory: components['schemas']['AbsenceCategorisation']
  reason: components['schemas']['AbsenceCategorisation']
  approve: boolean
  result: components['schemas']['AuditHistory']
}>
