export default interface Prisoner {
  prisonerNumber: string
  firstName: string
  lastName: string
  cellLocation: string
  prisonId: string
  dateOfBirth: string
  status: string
  prisonName: string

  restrictedPatient: boolean
  supportingPrisonId?: string
  previousPrisonId?: string
  previousPrisonLeavingDate?: string
  lastPrisonId?: string
  releaseDate?: string

  alerts?: {
    alertType: string
    alertCode: string
    active: boolean
    expired: boolean
  }[]
}
