import { Request } from 'express'
import { addDays, differenceInDays, format } from 'date-fns'
import { RotatingPatternInterval } from '../../../@types/journeys'

export const getOccurrencesToMatch = <T, ResBody, ReqBody, Q>(req: Request<T, ResBody, ReqBody, Q>) => {
  const journey = req.journeyData.addTemporaryAbsence!

  let occurrencesToMatch: {
    releaseAt: string
    returnBy: string
    locationIdx?: number
  }[] = []

  if (journey.patternType === 'FREEFORM') {
    occurrencesToMatch = journey.freeFormPattern!.map(({ startDate, startTime, returnDate, returnTime }) => ({
      releaseAt: `${startDate}T${startTime}:00`,
      returnBy: `${returnDate}T${returnTime}:00`,
    }))
  }

  if (journey.patternType === 'WEEKLY') {
    const numberOfWeeks = Math.ceil((differenceInDays(journey.toDate!, journey.fromDate!) + 2) / 7)
    occurrencesToMatch = Array.from(new Array(numberOfWeeks).keys())
      .map(idx => {
        const fromDate = format(addDays(journey.fromDate!, idx * 7), 'yyyy-MM-dd')
        let toDate = format(addDays(journey.fromDate!, idx * 7 + 6), 'yyyy-MM-dd')
        if (toDate > journey.toDate!) toDate = journey.toDate!
        const isFinalWeek = idx === numberOfWeeks - 1

        const startDoW = new Date(fromDate).getDay() - 1

        return journey
          .weeklyPattern!.map(({ day, overnight, startTime, returnTime }) => {
            const dayDiff = (day - startDoW + 7) % 7
            const startDate = addDays(new Date(fromDate), dayDiff)
            const returnDate = overnight ? addDays(startDate, 1) : startDate
            return {
              startDate: format(startDate, 'yyyy-MM-dd'),
              returnDate: format(returnDate, 'yyyy-MM-dd'),
              startTime,
              returnTime,
            }
          })
          .filter(
            ({ startDate, returnDate }) => startDate >= fromDate && (isFinalWeek ? returnDate : startDate) <= toDate,
          )
          .map(({ startDate, startTime, returnDate, returnTime }) => ({
            releaseAt: `${startDate}T${startTime}:00`,
            returnBy: `${returnDate}T${returnTime}:00`,
          }))
      })
      .flat()
  }

  if (journey.patternType === 'ROTATING') {
    let currentDay = new Date(journey.fromDate!)
    const rotatingTime = iterateRotatingPattern(journey.rotatingPattern!.intervals)

    while (format(currentDay, 'yyyy-MM-dd') <= journey.toDate!) {
      const time = rotatingTime.next().value
      if (time) {
        const startDate = format(currentDay, 'yyyy-MM-dd')
        const returnDate = time.startTime >= time.returnTime ? format(addDays(currentDay, 1), 'yyyy-MM-dd') : startDate
        if (returnDate <= journey.toDate!) {
          occurrencesToMatch.push({
            releaseAt: `${startDate}T${time.startTime}:00`,
            returnBy: `${returnDate}T${time.returnTime}:00`,
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
