import { Request } from 'express'
import { AddTemporaryAbsenceJourney } from '../../../@types/journeys'
import logger from '../../../../logger'
import { saveCategorySubJourney, updateCategorySubJourney } from '../../common/utils'
import { components } from '../../../@types/externalMovements'

export class AddTapFlowControl {
  static getBackUrl<T, ResBody, ReqBody, Q>(req: Request<T, ResBody, ReqBody, Q>, normalPreviousPage: string): string {
    // normal flow
    if (!req.journeyData.isCheckAnswers) return normalPreviousPage

    // check answers flow
    const journey = req.journeyData.addTemporaryAbsence!
    switch (normalPreviousPage) {
      case 'start-date':
        return journey.startDateTimeSubJourney ? normalPreviousPage : 'check-answers'
      case 'accompanied-or-unaccompanied':
        return journey.accompaniedSubJourney ? normalPreviousPage : 'check-answers'
      default:
        return 'check-answers'
    }
  }

  static saveDataAndGetNextPage<T, ResBody, ReqBody, Q>(
    req: Request<T, ResBody, ReqBody, Q>,
    data: AddTemporaryAbsenceJourney,
  ): string {
    const journey = req.journeyData.addTemporaryAbsence!

    if (journey.repeat) return this.saveDataAndGetNextPageForRepeatingTap(req, data)

    // Check answers flow
    if (req.journeyData.isCheckAnswers) {
      if (data.absenceType) {
        if (data.absenceType.code === journey.absenceType?.code) return 'check-answers'
        updateCategorySubJourney(req, 'ABSENCE_TYPE', data.absenceType)
        if (!data.absenceType.nextDomain) {
          saveCategorySubJourney(req)
          return 'check-answers'
        }
        return getUrlForNextDomain(data.absenceType.nextDomain)
      }
      if (data.absenceSubType) {
        if (data.absenceSubType.code === journey.absenceSubType?.code) return 'check-answers'
        updateCategorySubJourney(req, 'ABSENCE_SUB_TYPE', data.absenceSubType)
        if (!data.absenceSubType.nextDomain) {
          saveCategorySubJourney(req)
          return 'check-answers'
        }
        return getUrlForNextDomain(data.absenceSubType.nextDomain)
      }
      if (data.reasonCategory) {
        if (data.reasonCategory.code === journey.reasonCategory?.code) return 'check-answers'
        updateCategorySubJourney(req, 'ABSENCE_REASON_CATEGORY', data.reasonCategory)
        if (!data.reasonCategory.nextDomain) {
          saveCategorySubJourney(req)
          return 'check-answers'
        }
        return getUrlForNextDomain(data.reasonCategory.nextDomain)
      }
      if (data.reason) {
        updateCategorySubJourney(req, 'ABSENCE_REASON', data.reason)
        saveCategorySubJourney(req)
      }
      if (data.repeat !== undefined) {
        journey.repeat = data.repeat
        // TODO: implement correct sub-journey flow for repeating answer
      }
      if (data.startDate && data.startTime) {
        if (`${data.startDate}${data.startTime}` >= `${journey.returnDate}${journey.returnTime}`) {
          journey.startDateTimeSubJourney = {
            startDate: data.startDate,
            startTime: data.startTime,
          }
          return 'end-date'
        }
        journey.startDate = data.startDate
        journey.startTime = data.startTime
      }
      if (data.returnDate && data.returnTime) {
        if (journey.startDateTimeSubJourney) {
          journey.startDate = journey.startDateTimeSubJourney.startDate
          journey.startTime = journey.startDateTimeSubJourney.startTime
          delete journey.startDateTimeSubJourney
        }
        journey.returnDate = data.returnDate
        journey.returnTime = data.returnTime
      }
      if (data.location) {
        journey.location = data.location
      }
      if (data.confirmLocationSubJourney) {
        if (journey.confirmLocationSubJourney) {
          journey.location = journey.confirmLocationSubJourney.location
          delete journey.confirmLocationSubJourney
        }
      }
      if (data.accompanied !== undefined) {
        if (data.accompanied && !journey.accompaniedBy) {
          journey.accompaniedSubJourney = { accompanied: data.accompanied }
          return 'accompanied'
        }
        journey.accompanied = data.accompanied
      }
      if (data.accompaniedBy) {
        if (journey.accompaniedSubJourney) {
          journey.accompanied = journey.accompaniedSubJourney.accompanied
          delete journey.accompaniedSubJourney
        }
        journey.accompaniedBy = data.accompaniedBy
      }
      if (data.transport) {
        journey.transport = data.transport
      }
      if (data.comments !== undefined) {
        journey.comments = data.comments
      }
      if (data.requireApproval !== undefined) {
        journey.requireApproval = data.requireApproval
      }

      return 'check-answers'
    }

    // Normal flow
    if (data.absenceType) {
      updateCategorySubJourney(req, 'ABSENCE_TYPE', data.absenceType)
      if (!data.absenceType.nextDomain) {
        saveCategorySubJourney(req)
        return 'single-or-repeating'
      }
      return getUrlForNextDomain(data.absenceType.nextDomain)
    }
    if (data.absenceSubType) {
      updateCategorySubJourney(req, 'ABSENCE_SUB_TYPE', data.absenceSubType)
      if (!data.absenceSubType.nextDomain) {
        saveCategorySubJourney(req)
        return 'single-or-repeating'
      }
      return getUrlForNextDomain(data.absenceSubType.nextDomain)
    }
    if (data.reasonCategory) {
      updateCategorySubJourney(req, 'ABSENCE_REASON_CATEGORY', data.reasonCategory)
      if (!data.reasonCategory.nextDomain) {
        saveCategorySubJourney(req)
        return 'single-or-repeating'
      }
      return getUrlForNextDomain(data.reasonCategory.nextDomain)
    }
    if (data.reason) {
      updateCategorySubJourney(req, 'ABSENCE_REASON', data.reason)
      saveCategorySubJourney(req)
      return 'single-or-repeating'
    }
    if (data.repeat !== undefined) {
      journey.repeat = data.repeat
      return data.repeat ? 'start-end-dates' : 'start-date'
    }
    if (data.startDate && data.startTime) {
      journey.startDateTimeSubJourney = {
        startDate: data.startDate,
        startTime: data.startTime,
      }
      return 'end-date'
    }
    if (data.returnDate && data.returnTime) {
      if (journey.startDateTimeSubJourney) {
        journey.startDate = journey.startDateTimeSubJourney.startDate
        journey.startTime = journey.startDateTimeSubJourney.startTime
        delete journey.startDateTimeSubJourney
      }
      journey.returnDate = data.returnDate
      journey.returnTime = data.returnTime
      return 'search-location'
    }
    if (data.location) {
      journey.location = data.location
      return 'accompanied-or-unaccompanied'
    }
    if (data.confirmLocationSubJourney) {
      if (journey.confirmLocationSubJourney) {
        journey.location = journey.confirmLocationSubJourney.location
        delete journey.confirmLocationSubJourney
      }
      return 'accompanied-or-unaccompanied'
    }
    if (data.accompanied !== undefined) {
      if (data.accompanied) {
        journey.accompaniedSubJourney = { accompanied: data.accompanied }
        return 'accompanied'
      }
      journey.accompanied = data.accompanied
      return 'transport'
    }
    if (data.accompaniedBy) {
      if (journey.accompaniedSubJourney) {
        journey.accompanied = journey.accompaniedSubJourney.accompanied
        delete journey.accompaniedSubJourney
      }
      journey.accompaniedBy = data.accompaniedBy
      return 'transport'
    }
    if (data.transport) {
      journey.transport = data.transport
      return 'comments'
    }
    if (data.comments !== undefined) {
      journey.comments = data.comments
      return 'approval'
    }
    if (data.requireApproval !== undefined) {
      journey.requireApproval = data.requireApproval
      return 'check-answers'
    }

    logger.warn('No valid data sent for AddTapFlowControl.saveDataAndGetNextPage')
    return ''
  }

  private static saveDataAndGetNextPageForRepeatingTap<T, ResBody, ReqBody, Q>(
    req: Request<T, ResBody, ReqBody, Q>,
    data: AddTemporaryAbsenceJourney,
  ): string {
    const journey = req.journeyData.addTemporaryAbsence!

    // Check answers flow
    if (req.journeyData.isCheckAnswers) {
      // TODO: add check answer flow
    }

    // Normal flow
    if (data.repeat !== undefined) {
      journey.repeat = data.repeat
      return data.repeat ? 'start-end-dates' : 'start-date'
    }

    if (data.start && data.end) {
      if (journey.start !== data.start || journey.end !== data.end) delete journey.isCheckPattern

      journey.start = data.start
      journey.end = data.end
      return 'repeating-pattern'
    }

    if (data.patternType) {
      if (journey.patternType !== data.patternType) delete journey.isCheckPattern

      journey.patternType = data.patternType

      if (journey.isCheckPattern) return 'check-absences'

      switch (data.patternType) {
        case 'FREEFORM':
          return 'select-days-and-times'
        case 'WEEKLY':
          return 'select-days-times-weekly'
        case 'BIWEEKLY':
          return 'select-days-times-biweekly'
        case 'ROTATING':
          return 'enter-rotating-pattern'
        case 'SHIFT':
          return 'enter-shift-pattern'
        default:
          throw new Error(`Unknown pattern type ${data.patternType}`)
      }
    }

    if (data.occurrences) {
      journey.occurrences = data.occurrences
      return 'accompanied-or-unaccompanied'
    }
    if (data.accompanied !== undefined) {
      if (data.accompanied) {
        journey.accompaniedSubJourney = { accompanied: data.accompanied }
        return 'accompanied'
      }
      journey.accompanied = data.accompanied
      return 'transport'
    }
    if (data.accompaniedBy) {
      if (journey.accompaniedSubJourney) {
        journey.accompanied = journey.accompaniedSubJourney.accompanied
        delete journey.accompaniedSubJourney
      }
      journey.accompaniedBy = data.accompaniedBy
      return 'transport'
    }
    if (data.transport) {
      journey.transport = data.transport
      return 'comments'
    }
    if (data.comments !== undefined) {
      journey.comments = data.comments
      return 'approval'
    }
    if (data.requireApproval !== undefined) {
      journey.requireApproval = data.requireApproval
      return 'check-answers'
    }

    logger.warn('No valid data sent for AddTapFlowControl.saveDataAndGetNextPageForRepeatingTap')
    return ''
  }
}

export const getUrlForNextDomain = (nextDomain: components['schemas']['AbsenceCategorisation']['nextDomain']) => {
  switch (nextDomain) {
    case 'ABSENCE_SUB_TYPE':
      return 'absence-subtype'
    case 'ABSENCE_REASON_CATEGORY':
      return 'reason-category'
    case 'ABSENCE_REASON':
      return 'reason'
    default:
      throw new Error(`Unrecognised absence categorisation domain: ${nextDomain}`)
  }
}
