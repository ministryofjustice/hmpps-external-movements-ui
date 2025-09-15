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
}>
