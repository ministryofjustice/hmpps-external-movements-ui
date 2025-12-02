import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { createBackUrlFor } from '../../../../middleware/history/historyMiddleware'

export const getBackToTapAuthorisationDetails = (req: Request, res: Response) =>
  createBackUrlFor(
    res,
    /temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    `/temporary-absence-authorisations/${req.journeyData.updateTapAuthorisation!.authorisation.id}`,
  )

export const getUpdateAbsenceCategorisationsForDomain = async (
  externalMovementsService: ExternalMovementsService,
  req: Request,
  res: Response,
  domain: 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON',
) => {
  const { absenceType, absenceSubType, reasonCategory, authorisation } = req.journeyData.updateTapAuthorisation!

  if (absenceType?.nextDomain === domain) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_TYPE', absenceType!.code)
  }

  if (absenceSubType?.nextDomain === domain) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_SUB_TYPE', absenceSubType!.code)
  }

  if (reasonCategory?.nextDomain === domain) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_REASON_CATEGORY', reasonCategory!.code)
  }

  if (domain !== 'ABSENCE_SUB_TYPE' && domain !== 'ABSENCE_REASON_CATEGORY' && authorisation.absenceReasonCategory) {
    return externalMovementsService.getAbsenceCategories(
      { res },
      'ABSENCE_REASON_CATEGORY',
      authorisation.absenceReasonCategory.code,
    )
  }

  if (domain !== 'ABSENCE_SUB_TYPE' && authorisation.absenceSubType) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_SUB_TYPE', authorisation.absenceSubType.code)
  }

  if (authorisation.absenceType) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_TYPE', authorisation.absenceType.code)
  }

  throw new Error(
    `No ${domain} found for Absence Type: ${absenceType?.code}, Absence Subtype: ${absenceSubType?.code}, Reason Category: ${reasonCategory?.code}`,
  )
}

export const getUpdateAbsenceCategoryBackUrl = (
  req: Request,
  domain: 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON' | null,
) => {
  const { absenceType, absenceSubType, reasonCategory, reason } = req.journeyData.updateTapAuthorisation!

  if ((absenceType?.nextDomain ?? null) === domain) {
    return 'absence-type'
  }
  if ((absenceSubType?.nextDomain ?? null) === domain) {
    return 'absence-subtype'
  }
  if (reasonCategory && (reasonCategory?.nextDomain ?? null) === domain) {
    return 'reason-category'
  }
  if (reason && (reason?.nextDomain ?? null) === domain) {
    return 'reason'
  }

  return '../edit'

  throw new Error(
    `No ${domain} back url for Absence Type: ${absenceType?.code}, Absence Subtype: ${absenceSubType?.code}, Reason Category: ${reasonCategory?.code}`,
  )
}
