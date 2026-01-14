import { Request } from 'express'
import { AddTemporaryAbsenceJourney } from '../../../@types/journeys'

const checkRepeatAbsencesFilled = (req: Request) => {
  const journey = req.journeyData.addTemporaryAbsence!
  if (!journey.patternType) return '/repeating-pattern'
  switch (journey.patternType) {
    case 'WEEKLY':
      return journey.weeklyPattern ? undefined : '/select-days-times-weekly'
    case 'BIWEEKLY':
      return journey.biweeklyPattern ? undefined : '/select-days-times-biweekly'
    case 'SHIFT':
      return journey.shiftPattern ? undefined : '/enter-shift-pattern'
    case 'FREEFORM':
      return journey.freeFormPattern ? undefined : '/select-days-and-times'
    default:
      return undefined
  }
}

const get = (req: Request, category: string, key: keyof AddTemporaryAbsenceJourney) => {
  // @ts-expect-error category is known
  return req.journeyData.addTemporaryAbsence?.[category]?.[key] || req.journeyData.addTemporaryAbsence?.[key]
}

export const guard = {
  'absence-type': () => undefined,
  'absence-subtype': (req: Request) => {
    const type = get(req, 'categorySubJourney', 'absenceType')
    if (type?.nextDomain === 'ABSENCE_SUB_TYPE') return undefined
    return '/absence-type'
  },
  reason: (req: Request) => {
    const type = get(req, 'categorySubJourney', 'absenceType')
    if (!type) return '/absence-type'
    const subtype = get(req, 'categorySubJourney', 'absenceSubType')
    const reasonCategory = get(req, 'categorySubJourney', 'reasonCategory')

    const nextDomains = [type.nextDomain, subtype?.nextDomain, reasonCategory?.nextDomain]

    // If no next domains are reason - then disallow access to this page
    if (!nextDomains.find(domain => domain === 'ABSENCE_REASON')) return '/reason-category'

    if (type.nextDomain === 'ABSENCE_REASON') return undefined
    if (type.nextDomain === 'ABSENCE_SUB_TYPE') {
      if (subtype?.nextDomain === 'ABSENCE_REASON') return undefined
      if (subtype?.nextDomain === 'ABSENCE_REASON_CATEGORY') {
        return reasonCategory ? undefined : '/reason-category'
      }

      return subtype ? undefined : '/absence-subtype'
    }

    // This is sort of undefined behaviour, just let them do it
    return undefined
  },
  'reason-category': (req: Request) => {
    const subtype = get(req, 'categorySubJourney', 'absenceSubType')
    return subtype?.nextDomain === 'ABSENCE_REASON_CATEGORY' ? undefined : '/absence-subtype'
  },
  'single-or-repeating': (req: Request) => {
    const type = get(req, 'categorySubJourney', 'absenceType')
    if (!type) return '/absence-type'
    const subtype = get(req, 'categorySubJourney', 'absenceSubType')
    const reasonCategory = get(req, 'categorySubJourney', 'reasonCategory')
    const reason = get(req, 'categorySubJourney', 'reason')

    if (!type.nextDomain) return undefined
    if (reason && !reason.nextDomain) return undefined
    if (reasonCategory && !reasonCategory.nextDomain) return undefined
    if (subtype && !subtype.nextDomain) return undefined

    // One of the requirements was not met - bounce back to reason and let that figure out where to go
    return '/reason'
  },
  'start-end-dates-and-times': (req: Request) =>
    get(req, '', 'repeat') === undefined ? '/single-or-repeating' : undefined,
  'search-location': (req: Request) => (get(req, '', 'returnDate') ? undefined : '/start-end-dates-and-times'),
  'enter-location': (req: Request) => {
    if (req.journeyData.addTemporaryAbsence!.repeat) return checkRepeatAbsencesFilled(req)
    return get(req, '', 'returnDate') ? undefined : '/end-date'
  },
  'accompanied-or-unaccompanied': (req: Request) => {
    if (req.journeyData.addTemporaryAbsence!.repeat)
      return get(req, '', 'occurrences') ? undefined : '/match-absences-and-locations'
    return get(req, '', 'location') ? undefined : '/search-location'
  },
  accompanied: (req: Request) =>
    get(req, 'accompaniedSubJourney', 'accompanied') ? undefined : '/accompanied-or-unaccompanied',
  transport: (req: Request) => {
    if (get(req, 'accompaniedSubJourney', 'accompanied')) {
      return get(req, 'accompaniedSubJourney', 'accompaniedBy') ? undefined : '/accompanied'
    }

    return req.journeyData.addTemporaryAbsence!.accompanied === false ||
      req.journeyData.addTemporaryAbsence!.accompaniedSubJourney?.accompanied === false
      ? undefined
      : '/accompanied-or-unaccompanied'
  },
  comments: (req: Request) => (get(req, '', 'transport') ? undefined : '/transport'),
  approval: (req: Request) => (get(req, '', 'comments') !== undefined ? undefined : '/comments'),
  'check-answers': (req: Request) => (get(req, '', 'requireApproval') !== undefined ? undefined : '/approval'),
  confirmation: (req: Request) => (req.journeyData.journeyCompleted ? undefined : '/check-answers'),

  'start-end-dates': (req: Request) => (get(req, '', 'repeat') === undefined ? '/single-or-repeating' : undefined),
  'repeating-pattern': (req: Request) =>
    get(req, '', 'start') === undefined || get(req, '', 'end') === undefined ? '/start-end-dates' : undefined,
  'select-days-and-times': (req: Request) =>
    get(req, '', 'patternType') === undefined ? '/repeating-pattern' : undefined,
  'select-days-times-weekly': (req: Request) =>
    get(req, '', 'patternType') === undefined ? '/repeating-pattern' : undefined,
  'select-days-times-biweekly': (req: Request) =>
    get(req, '', 'patternType') === undefined ? '/repeating-pattern' : undefined,
  'enter-shift-pattern': (req: Request) =>
    get(req, '', 'patternType') === undefined ? '/repeating-pattern' : undefined,
  'check-absences': checkRepeatAbsencesFilled,
  'search-locations': checkRepeatAbsencesFilled,
  'match-absences-and-locations': (req: Request) =>
    req.journeyData.addTemporaryAbsence!.locations?.length ? undefined : '/search-locations',
}
