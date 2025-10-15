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
  id: string
  flat?: string | null
  property?: string | null
  street?: string | null
  area?: string | null
  cityDescription?: string | null
  countyDescription?: string | null
  postcode?: string | null
  countryDescription: string | null
}

export type JourneyData = {
  instanceUnixEpoch: number
  prisonerDetails?: PrisonerDetails
  addTemporaryAbsence?: AddTemporaryAbsenceJourney
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
  locationSubJourney: {
    locationType: components['schemas']['CodedDescription']
  }
  locationType: components['schemas']['CodedDescription']
  locationSearch: string
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
}>
