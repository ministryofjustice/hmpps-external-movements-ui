import { Request } from 'express'
import { addDays, differenceInDays, format } from 'date-fns'
import { DayOfWeekTimeSlot, RotatingPatternInterval, ShiftPatternInterval } from '../../../@types/journeys'

export const getOccurrencesToMatch = <T, ResBody, ReqBody, Q>(req: Request<T, ResBody, ReqBody, Q>) => {
  const journey = req.journeyData.addTemporaryAbsence!

  let occurrencesToMatch: {
    start: string
    end: string
    locationIdx?: number
  }[] = []

  if (journey.patternType === 'FREEFORM') {
    occurrencesToMatch = journey.freeFormPattern!.map(({ startDate, startTime, returnDate, returnTime }) => ({
      start: `${startDate}T${startTime}:00`,
      end: `${returnDate}T${returnTime}:00`,
    }))
  }

  if (journey.patternType === 'WEEKLY') {
    const numberOfWeeks = Math.ceil((differenceInDays(journey.end!, journey.start!) + 2) / 7)
    occurrencesToMatch = Array.from(new Array(numberOfWeeks).keys())
      .map(idx => {
        const from = format(addDays(journey.start!, idx * 7), 'yyyy-MM-dd')
        let to = format(addDays(journey.start!, idx * 7 + 6), 'yyyy-MM-dd')
        if (to > journey.end!) to = journey.end!
        const isFinalWeek = idx === numberOfWeeks - 1

        const startDoW = new Date(from).getDay() - 1

        return journey
          .weeklyPattern!.map(({ day, overnight, startTime, returnTime }) => {
            const dayDiff = (day - startDoW + 7) % 7
            const startDate = addDays(new Date(from), dayDiff)
            const returnDate = overnight ? addDays(startDate, 1) : startDate
            return {
              startDate: format(startDate, 'yyyy-MM-dd'),
              returnDate: format(returnDate, 'yyyy-MM-dd'),
              startTime,
              returnTime,
            }
          })
          .filter(({ startDate, returnDate }) => startDate >= from && (isFinalWeek ? returnDate : startDate) <= to)
          .map(({ startDate, startTime, returnDate, returnTime }) => ({
            start: `${startDate}T${startTime}:00`,
            end: `${returnDate}T${returnTime}:00`,
          }))
      })
      .flat()
      .sort((a, b) => a.start.localeCompare(b.start))
  }

  if (journey.patternType === 'ROTATING') {
    let currentDay = new Date(journey.start!)
    const rotatingTime = iterateRotatingPattern(journey.rotatingPattern!.intervals)

    while (format(currentDay, 'yyyy-MM-dd') <= journey.end!) {
      const time = rotatingTime.next().value
      if (time) {
        const startDate = format(currentDay, 'yyyy-MM-dd')
        const returnDate = time.startTime >= time.returnTime ? format(addDays(currentDay, 1), 'yyyy-MM-dd') : startDate
        if (returnDate <= journey.end!) {
          occurrencesToMatch.push({
            start: `${startDate}T${time.startTime}:00`,
            end: `${returnDate}T${time.returnTime}:00`,
          })
        }
      }
      currentDay = addDays(currentDay, 1)
    }
  }

  if (journey.patternType === 'SHIFT') {
    let currentDay = new Date(journey.start!)
    const rotatingTime = iterateShiftPattern(journey.shiftPattern!)

    while (format(currentDay, 'yyyy-MM-dd') <= journey.end!) {
      const time = rotatingTime.next().value
      if (time) {
        const startDate = format(currentDay, 'yyyy-MM-dd')
        const returnDate = time.startTime >= time.returnTime ? format(addDays(currentDay, 1), 'yyyy-MM-dd') : startDate
        if (returnDate <= journey.end!) {
          occurrencesToMatch.push({
            start: `${startDate}T${time.startTime}:00`,
            end: `${returnDate}T${time.returnTime}:00`,
          })
        }
      }
      currentDay = addDays(currentDay, 1)
    }
  }

  if (journey.patternType === 'BIWEEKLY') {
    let currentDay = new Date(journey.start!)
    const rotatingTime = iterateBiweeklyPattern(
      journey.biweeklyPattern!.weekA,
      journey.biweeklyPattern!.weekB,
      journey.start!,
    )

    while (format(currentDay, 'yyyy-MM-dd') <= journey.end!) {
      const time = rotatingTime.next().value
      if (time) {
        const startDate = format(currentDay, 'yyyy-MM-dd')
        const returnDate = time.startTime >= time.returnTime ? format(addDays(currentDay, 1), 'yyyy-MM-dd') : startDate
        if (returnDate <= journey.end!) {
          occurrencesToMatch.push({
            start: `${startDate}T${time.startTime}:00`,
            end: `${returnDate}T${time.returnTime}:00`,
          })
        }
      }
      currentDay = addDays(currentDay, 1)
    }
  }

  return occurrencesToMatch
}

function* iterateRotatingPattern(pattern: RotatingPatternInterval[]) {
  for (;;) {
    for (const interval of pattern) {
      if (interval.items) {
        for (const item of interval.items) {
          yield item
        }
      } else {
        for (let i = 0; i < interval.count; i += 1) {
          yield null
        }
      }
    }
  }
}

function* iterateShiftPattern(pattern: ShiftPatternInterval[]) {
  for (;;) {
    for (const interval of pattern) {
      for (let i = 0; i < interval.count; i += 1) {
        if (interval.type === 'REST') {
          yield null
        } else {
          yield interval
        }
      }
    }
  }
}

function* iterateBiweeklyPattern(firstWeek: DayOfWeekTimeSlot[], secondWeek: DayOfWeekTimeSlot[], startDate: string) {
  const weekOne = Array.from(new Array(7).keys()).map(dayOfWeek => firstWeek.find(({ day }) => day === dayOfWeek))
  const weekTwo = Array.from(new Array(7).keys()).map(dayOfWeek => secondWeek.find(({ day }) => day === dayOfWeek))

  const numberOfDaysToSkip = (new Date(startDate).getDay() + 6) % 7
  for (const day of weekOne.slice(numberOfDaysToSkip)) yield day

  for (;;) {
    for (const day of weekTwo) yield day
    for (const day of weekOne) yield day
  }
}
