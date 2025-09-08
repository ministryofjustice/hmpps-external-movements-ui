import { components } from '../externalMovements'

export interface PrisonerDetails {
  prisonerNumber: string
  lastName: string
  firstName: string
  dateOfBirth: string
  prisonName?: string | undefined
  cellLocation?: string | undefined
}

export type JourneyData = {
  instanceUnixEpoch: number
  prisonerDetails?: PrisonerDetails
  addTemporaryAbsence?: AddTemporaryAbsenceJourney
  isCheckAnswers?: boolean
  journeyCompleted?: boolean
  b64History?: string | undefined
}

export type AddTemporaryAbsenceJourney = Partial<{
  absenceType: components['schemas']['AbsenceCategorisation']
}>
