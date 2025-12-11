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

  const startDate = format(addDays(new Date(req.journeyData.addTemporaryAbsence!.start!), (week - 1) * 7), 'yyyy-MM-dd')
  const endDate = format(
    addDays(new Date(req.journeyData.addTemporaryAbsence!.start!), (week - 1) * 7 + 6),
    'yyyy-MM-dd',
  )

  const previousIdx = week > 1 ? (week - 1).toString() : undefined
  const nextIdx = endDate < req.journeyData.addTemporaryAbsence!.end! ? (week + 1).toString() : undefined

  const isOptional =
    (previousIdx && nextIdx) ||
    (nextIdx === undefined &&
      req.journeyData.addTemporaryAbsence!.freeFormPattern?.find(
        ({ returnDate }) => returnDate === req.journeyData.addTemporaryAbsence!.end,
      ))

  return {
    startDate,
    endDate: endDate > req.journeyData.addTemporaryAbsence!.end! ? req.journeyData.addTemporaryAbsence!.end! : endDate,
    outOfRange: startDate > req.journeyData.addTemporaryAbsence!.end!,
    previousIdx,
    nextIdx,
    isOptional: !!isOptional,
  }
}
