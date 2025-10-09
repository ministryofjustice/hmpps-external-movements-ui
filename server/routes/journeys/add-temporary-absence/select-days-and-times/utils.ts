import { Request } from 'express'
import { addDays, format } from 'date-fns'
import { getIdx } from '../../../common/utils'

type SelectDayRange = {
  startDate: string
  endDate: string
  outOfRange: boolean
  previousIdx: string | undefined
  nextIdx: string | undefined
  isOptional: boolean
}

export const getSelectDayRange = (req: Request<{ idx?: string }>): SelectDayRange => {
  const week = getIdx(req.params.idx)

  const startDate = format(
    addDays(new Date(req.journeyData.addTemporaryAbsence!.fromDate!), (week - 1) * 7),
    'yyyy-MM-dd',
  )
  const endDate = format(
    addDays(new Date(req.journeyData.addTemporaryAbsence!.fromDate!), (week - 1) * 7 + 6),
    'yyyy-MM-dd',
  )

  const previousIdx = week > 1 ? (week - 1).toString() : undefined
  const nextIdx = endDate < req.journeyData.addTemporaryAbsence!.toDate! ? (week + 1).toString() : undefined

  const isOptional =
    (previousIdx && nextIdx) ||
    (nextIdx === undefined &&
      req.journeyData.addTemporaryAbsence!.freeFormPattern?.find(
        ({ returnDate }) => returnDate === req.journeyData.addTemporaryAbsence!.toDate,
      ))

  return {
    startDate,
    endDate:
      endDate > req.journeyData.addTemporaryAbsence!.toDate! ? req.journeyData.addTemporaryAbsence!.toDate! : endDate,
    outOfRange: startDate > req.journeyData.addTemporaryAbsence!.toDate!,
    previousIdx,
    nextIdx,
    isOptional: !!isOptional,
  }
}
