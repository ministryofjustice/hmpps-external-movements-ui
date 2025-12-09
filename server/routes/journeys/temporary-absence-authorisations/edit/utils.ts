import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { components } from '../../../../@types/externalMovements'

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
  const { absenceType, absenceSubType, reasonCategory, reason, backUrl } = req.journeyData.updateTapAuthorisation!

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

  return backUrl

  throw new Error(
    `No ${domain} back url for Absence Type: ${absenceType?.code}, Absence Subtype: ${absenceSubType?.code}, Reason Category: ${reasonCategory?.code}`,
  )
}

const getNextDomain = <T, ResBody, ReqBody, Q>(
  req: Request<T, ResBody, ReqBody, Q>,
  domain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON',
) => {
  const { absenceType, absenceSubType, reasonCategory, reason, authorisation } = req.journeyData.updateTapAuthorisation!

  if (domain === 'ABSENCE_TYPE') {
    if (absenceType) return absenceType.nextDomain
    if (authorisation.absenceSubType) return 'ABSENCE_SUB_TYPE'
    if (authorisation.absenceReasonCategory) return 'ABSENCE_REASON_CATEGORY'
    if (authorisation.absenceReason) return 'ABSENCE_REASON'
    return null
  }

  if (domain === 'ABSENCE_SUB_TYPE') {
    if (absenceSubType) return absenceSubType.nextDomain
    if (authorisation.absenceReasonCategory) return 'ABSENCE_REASON_CATEGORY'
    if (authorisation.absenceReason) return 'ABSENCE_REASON'
    return null
  }

  if (domain === 'ABSENCE_REASON_CATEGORY') {
    if (reasonCategory) return reasonCategory.nextDomain
    if (authorisation.absenceReason) return 'ABSENCE_REASON'
    return null
  }

  if (reason) return reason.nextDomain
  return null
}

export const getUpdateAbsenceCategoryRequest = <T, ResBody, ReqBody, Q>(req: Request<T, ResBody, ReqBody, Q>) => {
  const { absenceType, absenceSubType, reasonCategory, reason, authorisation } = req.journeyData.updateTapAuthorisation!

  const requestBody: components['schemas']['RecategoriseAuthorisation'] = {
    type: 'RecategoriseAuthorisation',
    absenceTypeCode: (absenceType ?? authorisation.absenceType)!.code,
  }

  let nextDomain = getNextDomain(req, 'ABSENCE_TYPE')

  while (nextDomain) {
    switch (nextDomain) {
      case 'ABSENCE_SUB_TYPE':
        requestBody.absenceSubTypeCode = (absenceSubType ?? authorisation.absenceSubType)!.code
        break
      case 'ABSENCE_REASON_CATEGORY':
        requestBody.absenceReasonCategoryCode = (reasonCategory ?? authorisation.absenceReasonCategory)!.code
        break
      case 'ABSENCE_REASON':
        requestBody.absenceReasonCode = (reason ?? authorisation.absenceReason)!.code
        break
      default:
        break
    }
    nextDomain = getNextDomain(
      req,
      nextDomain as 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON' | 'ABSENCE_TYPE',
    )
  }

  return requestBody
}
