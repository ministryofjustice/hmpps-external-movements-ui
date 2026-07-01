import { Request, Response } from 'express'
import { differenceInDays, format, subDays } from 'date-fns'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { components } from '../../../../@types/externalMovements'
import { UpdateTapAuthorisationJourney } from '../../../../@types/journeys'
import { getOccurrencesToMatch } from '../../add-temporary-absence/utils'

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

export function* iterateCalendarDays(dateFrom: string, dateTo: string) {
  const currentDay = new Date(dateFrom)
  let currentMonth = currentDay.getMonth()

  const beginPadStartLength = (currentDay.getDay() + 6) % 7

  if (beginPadStartLength) {
    for (let i = beginPadStartLength; i > 0; i -= 1) {
      const day = new Date(dateFrom)
      day.setDate(day.getDate() - i)
      yield {
        month: currentMonth,
        date: day.getMonth() === currentMonth ? day.getDate() : '',
        inRange: false,
      }
    }
  }

  while (currentDay.toLocaleDateString('en-CA') <= dateTo) {
    if (currentDay.getMonth() !== currentMonth) {
      const padStartLength = (currentDay.getDay() + 6) % 7
      if (padStartLength) {
        for (let i = 0; i < 7 - padStartLength; i += 1) {
          yield {
            month: currentMonth,
            date: '',
            inRange: false,
          }
        }

        for (let i = 0; i < padStartLength; i += 1) {
          yield {
            month: currentDay.getMonth(),
            date: '',
            inRange: false,
          }
        }
      }
    }
    currentMonth = currentDay.getMonth()
    yield {
      month: currentDay.getMonth(),
      date: currentDay.getDate(),
      inRange: true,
    }
    currentDay.setDate(currentDay.getDate() + 1)
  }
}

export const getOccurrences = (req: Request, startOverride?: string, endOverride?: string) => {
  const { authorisation } = req.journeyData.updateTapAuthorisation!
  const start = startOverride ?? req.journeyData.updateTapAuthorisation!.start
  const end = endOverride ?? req.journeyData.updateTapAuthorisation!.end

  if (!['WEEKLY', 'BIWEEKLY', 'SHIFT'].includes(authorisation.schedule!.type ?? '')) {
    throw new Error('Invalid TAP plan to auto fill occurrences')
  }

  // @ts-expect-error cast TAP authorisation into an incomplete addTemporaryAbsence journey data
  req.journeyData.addTemporaryAbsence = {
    ...authorisation.schedule!,
    start: getStartDate(req.journeyData.updateTapAuthorisation!, start!),
    end: end!,
    patternType: authorisation.schedule!.type as 'WEEKLY' | 'BIWEEKLY' | 'SHIFT',
  }

  const occurrences = getOccurrencesToMatch(req)

  return occurrences.filter(itm => {
    const startDate = itm.start.substring(0, 10)
    const endDate = itm.end.substring(0, 10)

    return startDate >= start! && (startDate < authorisation.start || endDate > authorisation.end)
  })
}

const getStartDate = (journey: UpdateTapAuthorisationJourney, start: string) => {
  const { authorisation } = journey

  if (authorisation.start === start) return start
  if (authorisation.start < start!) return authorisation.start

  const cycleLength = getRepeatCycle(journey)
  const daysBeforeOriginalStart = Math.ceil(differenceInDays(authorisation.start, start!) / cycleLength) * cycleLength

  return format(subDays(authorisation.start, daysBeforeOriginalStart), 'yyyy-MM-dd')
}

const getRepeatCycle = (journey: UpdateTapAuthorisationJourney) => {
  const { authorisation } = journey
  if (authorisation.schedule!.type === 'WEEKLY') return 7
  if (authorisation.schedule!.type === 'BIWEEKLY') return 14

  return (authorisation.schedule as components['schemas']['ShiftSchedule']).shiftPattern.reduce(
    (ttl, itm) => ttl + itm.count,
    0,
  )
}
