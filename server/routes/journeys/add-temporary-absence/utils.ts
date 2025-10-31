import { Request } from 'express'

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

  // TODO: add logic for WEEKLY pattern and ROTATING pattern

  return occurrencesToMatch
}
