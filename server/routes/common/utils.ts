import { Request, Response } from 'express'
import { components, operations } from '../../@types/externalMovements'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { AddTemporaryAbsenceJourney } from '../../@types/journeys'

export const getReferenceDataOptionsForRadios = async (
  externalMovementsService: ExternalMovementsService,
  res: Response,
  domain: operations['getDomain']['parameters']['path']['domain'],
  value?: components['schemas']['CodedDescription'] | string,
) => [
  ...(await externalMovementsService.getReferenceData({ res }, domain)).map(refData => ({
    value: refData.code,
    text: refData.description,
    hint: refData.hintText ? { text: refData.hintText } : undefined,
    checked: typeof value === 'string' ? refData.code === value : refData.code === value?.code,
  })),
]

export const absenceCategorisationMapper = ({
  code,
  description,
  hintText,
}: components['schemas']['AbsenceCategorisation']) => ({
  value: code,
  text: description.replace(/Paid work - |Unpaid work - /, ''),
  hint: hintText ? { text: hintText } : undefined,
})

export const getAbsenceCategorisationsForDomain = async (
  externalMovementsService: ExternalMovementsService,
  req: Request,
  res: Response,
  domain: 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON',
) => {
  const { absenceType, absenceSubType, reasonCategory } = getCategoryFromJourney(req.journeyData.addTemporaryAbsence!)

  if (absenceType?.nextDomain === domain) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_TYPE', absenceType!.code)
  }

  if (absenceSubType?.nextDomain === domain) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_SUB_TYPE', absenceSubType!.code)
  }

  if (reasonCategory?.nextDomain === domain) {
    return externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_REASON_CATEGORY', reasonCategory!.code)
  }

  throw new Error(
    `No ${domain} found for Absence Type: ${absenceType?.code}, Absence Subtype: ${absenceSubType?.code}, Reason Category: ${reasonCategory?.code}`,
  )
}

export const getAbsenceCategoryBackUrl = (
  req: Request,
  domain: 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON' | null,
) => {
  if (req.journeyData.isCheckAnswers && !req.journeyData.addTemporaryAbsence!.categorySubJourney) return 'check-answers'

  const { absenceType, absenceSubType, reasonCategory, reason } = getCategoryFromJourney(
    req.journeyData.addTemporaryAbsence!,
  )

  if ((absenceType?.nextDomain ?? null) === domain) {
    if (
      req.journeyData.isCheckAnswers &&
      req.journeyData.addTemporaryAbsence!.categorySubJourney?.absenceType?.code ===
        req.journeyData.addTemporaryAbsence!.absenceType?.code
    ) {
      return 'check-answers'
    }
    return 'absence-type'
  }
  if ((absenceSubType?.nextDomain ?? null) === domain) {
    if (
      req.journeyData.isCheckAnswers &&
      req.journeyData.addTemporaryAbsence!.categorySubJourney?.absenceSubType?.code ===
        req.journeyData.addTemporaryAbsence!.absenceSubType?.code
    ) {
      return 'check-answers'
    }
    return 'absence-subtype'
  }
  if ((reasonCategory?.nextDomain ?? null) === domain) {
    // no short-cut back to CYA for unchanged reason category, because Paid work and Unpaid work category page always need to go back and forth to reason page
    return 'reason-category'
  }
  if ((reason?.nextDomain ?? null) === domain) {
    return 'reason'
  }

  throw new Error(
    `No ${domain} back url for Absence Type: ${absenceType?.code}, Absence Subtype: ${absenceSubType?.code}, Reason Category: ${reasonCategory?.code}`,
  )
}

export const getCategoryFromJourney = (journey: AddTemporaryAbsenceJourney) =>
  journey.categorySubJourney ?? {
    absenceType: journey.absenceType,
    absenceSubType: journey.absenceSubType,
    reasonCategory: journey.reasonCategory,
    reason: journey.reason,
  }

export const updateCategorySubJourney = <T, ResBody, ReqBody, Q>(
  req: Request<T, ResBody, ReqBody, Q>,
  domain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY' | 'ABSENCE_REASON',
  val: components['schemas']['AbsenceCategorisation'],
) => {
  if (req.journeyData.addTemporaryAbsence!.categorySubJourney) {
    const { absenceType, absenceSubType, reasonCategory } = req.journeyData.addTemporaryAbsence!.categorySubJourney!
    switch (domain) {
      case 'ABSENCE_TYPE':
        if (absenceType?.code !== val.code) {
          delete req.journeyData.addTemporaryAbsence!.categorySubJourney.absenceSubType
          delete req.journeyData.addTemporaryAbsence!.categorySubJourney.reasonCategory
          delete req.journeyData.addTemporaryAbsence!.categorySubJourney.reason
        }
        req.journeyData.addTemporaryAbsence!.categorySubJourney.absenceType = val
        break
      case 'ABSENCE_SUB_TYPE':
        if (absenceSubType?.code !== val.code) {
          delete req.journeyData.addTemporaryAbsence!.categorySubJourney.reasonCategory
          delete req.journeyData.addTemporaryAbsence!.categorySubJourney.reason
        }
        req.journeyData.addTemporaryAbsence!.categorySubJourney.absenceSubType = val
        break
      case 'ABSENCE_REASON_CATEGORY':
        if (reasonCategory?.code !== val.code) {
          delete req.journeyData.addTemporaryAbsence!.categorySubJourney.reason
        }
        req.journeyData.addTemporaryAbsence!.categorySubJourney.reasonCategory = val
        break
      case 'ABSENCE_REASON':
        req.journeyData.addTemporaryAbsence!.categorySubJourney.reason = val
        break
      default:
        break
    }
  } else {
    const { absenceType, absenceSubType, reasonCategory, reason } = req.journeyData.addTemporaryAbsence!
    switch (domain) {
      case 'ABSENCE_TYPE':
        if (absenceType?.code !== val.code) {
          req.journeyData.addTemporaryAbsence!.categorySubJourney = { absenceType: val }
        } else {
          req.journeyData.addTemporaryAbsence!.categorySubJourney = {
            ...(absenceType ? { absenceType } : {}),
            ...(absenceSubType ? { absenceSubType } : {}),
            ...(reasonCategory ? { reasonCategory } : {}),
            ...(reason ? { reason } : {}),
          }
        }
        break
      case 'ABSENCE_SUB_TYPE':
        if (absenceSubType?.code !== val.code) {
          req.journeyData.addTemporaryAbsence!.categorySubJourney = {
            ...(absenceType ? { absenceType } : {}),
            absenceSubType: val,
          }
        } else {
          req.journeyData.addTemporaryAbsence!.categorySubJourney = {
            ...(absenceType ? { absenceType } : {}),
            ...(absenceSubType ? { absenceSubType } : {}),
            ...(reasonCategory ? { reasonCategory } : {}),
            ...(reason ? { reason } : {}),
          }
        }
        break
      case 'ABSENCE_REASON_CATEGORY':
        if (reasonCategory?.code !== val.code) {
          req.journeyData.addTemporaryAbsence!.categorySubJourney = {
            ...(absenceType ? { absenceType } : {}),
            ...(absenceSubType ? { absenceSubType } : {}),
            reasonCategory: val,
          }
        } else {
          req.journeyData.addTemporaryAbsence!.categorySubJourney = {
            ...(absenceType ? { absenceType } : {}),
            ...(absenceSubType ? { absenceSubType } : {}),
            ...(reasonCategory ? { reasonCategory } : {}),
            ...(reason ? { reason } : {}),
          }
        }
        break
      case 'ABSENCE_REASON':
        req.journeyData.addTemporaryAbsence!.categorySubJourney = {
          ...(absenceType ? { absenceType } : {}),
          ...(absenceSubType ? { absenceSubType } : {}),
          ...(reasonCategory ? { reasonCategory } : {}),
          reason: val,
        }
        break
      default:
        break
    }
  }
}

export const saveCategorySubJourney = <T, ResBody, ReqBody, Q>(req: Request<T, ResBody, ReqBody, Q>) => {
  delete req.journeyData.addTemporaryAbsence!.absenceType
  delete req.journeyData.addTemporaryAbsence!.absenceSubType
  delete req.journeyData.addTemporaryAbsence!.reasonCategory
  delete req.journeyData.addTemporaryAbsence!.reason

  const { absenceType, absenceSubType, reasonCategory, reason } =
    req.journeyData.addTemporaryAbsence!.categorySubJourney!

  if (absenceType) req.journeyData.addTemporaryAbsence!.absenceType = absenceType
  if (absenceSubType) req.journeyData.addTemporaryAbsence!.absenceSubType = absenceSubType
  if (reasonCategory) req.journeyData.addTemporaryAbsence!.reasonCategory = reasonCategory
  if (reason) req.journeyData.addTemporaryAbsence!.reason = reason

  delete req.journeyData.addTemporaryAbsence!.categorySubJourney
}
