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
      case 'location-type':
        return journey.locationSubJourney ? normalPreviousPage : 'check-answers'
      default:
        return 'check-answers'
    }
  }

  static saveDataAndGetNextPage<T, ResBody, ReqBody, Q>(
    req: Request<T, ResBody, ReqBody, Q>,
    data: AddTemporaryAbsenceJourney,
  ): string {
    const journey = req.journeyData.addTemporaryAbsence!

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
      if (data.locationType) {
        if (data.locationType.code === journey.locationType?.code) return 'check-answers'
        journey.locationSubJourney = { locationType: data.locationType }
        return 'location-search'
      }
      if (data.location) {
        journey.location = data.location
        journey.locationType = journey.locationSubJourney!.locationType
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
      if (data.notes !== undefined) {
        journey.notes = data.notes
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
      return 'location-type'
    }
    if (data.locationType) {
      journey.locationSubJourney = { locationType: data.locationType }
      return 'location-search'
    }
    if (data.location) {
      journey.location = data.location
      journey.locationType = journey.locationSubJourney!.locationType
      delete journey.locationSubJourney
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
    if (data.notes !== undefined) {
      journey.notes = data.notes
      return 'approval'
    }
    if (data.requireApproval !== undefined) {
      journey.requireApproval = data.requireApproval
      return 'check-answers'
    }

    logger.warn('No valid data sent for AddTapFlowControl.saveDataAndGetNextPage')
    return ''
  }
}

const getUrlForNextDomain = (nextDomain: components['schemas']['AbsenceCategorisation']['nextDomain']) => {
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
