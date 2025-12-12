import { Request } from 'express'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { getIdx } from '../../../common/utils'

type SelectDayRange = {
  startDate: string
  endDate: string
  outOfRange: boolean
  idx: number
  previousIdx: string | undefined
  nextIdx: string | undefined
  isOptional: boolean
  pageCount: number
}

export const getSelectDayRange = (req: Request<{ idx?: string }>): SelectDayRange => {
  const month = getIdx(req.params.idx)

  const start = req.journeyData.addTemporaryAbsence!.start!
  const end = req.journeyData.addTemporaryAbsence!.end!

  const startDate = format(
    month === 1 ? new Date(start) : addMonths(startOfMonth(new Date(start)), month - 1),
    'yyyy-MM-dd',
  )
  let endDate = format(endOfMonth(new Date(startDate)), 'yyyy-MM-dd')
  if (endDate > end) endDate = end

  const previousIdx = month > 1 ? (month - 1).toString() : undefined
  const nextIdx = endDate < end ? (month + 1).toString() : undefined

  const isOptional =
    (previousIdx && nextIdx) ||
    (nextIdx === undefined &&
      req.journeyData.addTemporaryAbsence!.freeFormPattern?.find(({ returnDate }) => returnDate === end))

  return {
    startDate,
    endDate: endDate > end ? end : endDate,
    outOfRange: startDate > end,
    idx: month,
    previousIdx,
    nextIdx,
    isOptional: !!isOptional,
    pageCount: (new Date(end).getMonth() - new Date(start).getMonth() + 13) % 12,
  }
}
