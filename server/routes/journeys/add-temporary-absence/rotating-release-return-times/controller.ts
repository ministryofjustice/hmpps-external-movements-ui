import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { AddTemporaryAbsenceJourney, RotatingPatternInterval } from '../../../../@types/journeys'

export class RotatingReleaseReturnTimesController {
  private timeTypes = ['Scheduled days', 'Scheduled nights']

  private fromIntervals = (
    isSameTime: boolean,
    intervals: RotatingPatternInterval[],
    formResponses: Record<string, string>[],
  ) => {
    let dayCount = 0
    let nightCount = 0
    const times = []

    if (isSameTime) {
      const dayStartTime = intervals.find(o => o.type === 'Scheduled days')?.items?.[0]?.startTime
      const dayReturnTime = intervals.find(o => o.type === 'Scheduled days')?.items?.[0]?.returnTime
      const nightStartTime = intervals.find(o => o.type === 'Scheduled nights')?.items?.[0]?.startTime
      const nightReturnTime = intervals.find(o => o.type === 'Scheduled nights')?.items?.[0]?.returnTime

      times.push({
        title: 'Working days',
        type: 'Scheduled days',
        releaseHour: formResponses?.[times.length]?.['releaseHour'] ?? dayStartTime?.split(':')[0],
        releaseMinute: formResponses?.[times.length]?.['releaseMinute'] ?? dayStartTime?.split(':')[1],
        returnHour: formResponses?.[times.length]?.['returnHour'] ?? dayReturnTime?.split(':')[0],
        returnMinute: formResponses?.[times.length]?.['returnMinute'] ?? dayReturnTime?.split(':')[1],
      })

      times.push({
        title: 'Working nights',
        type: 'Scheduled nights',
        releaseHour: formResponses?.[times.length]?.['releaseHour'] ?? nightStartTime?.split(':')[0],
        releaseMinute: formResponses?.[times.length]?.['releaseMinute'] ?? nightStartTime?.split(':')[1],
        returnHour: formResponses?.[times.length]?.['returnHour'] ?? nightReturnTime?.split(':')[0],
        returnMinute: formResponses?.[times.length]?.['returnMinute'] ?? nightReturnTime?.split(':')[1],
      })

      return times
    }

    for (const interval of intervals.filter(o => this.timeTypes.includes(o.type))) {
      for (let i = 0; i < interval.count; i += 1) {
        let title = ''
        if (interval.type === 'Scheduled days') {
          dayCount += 1
          title = `Working day ${dayCount}`
        } else {
          nightCount += 1
          title = `Working night ${nightCount}`
        }

        times.push({
          title,
          type: interval.type,
          releaseHour: formResponses?.[times.length]?.['releaseHour'] ?? interval.items?.[i]?.startTime?.split(':')[0],
          releaseMinute:
            formResponses?.[times.length]?.['releaseMinute'] ?? interval.items?.[i]?.startTime?.split(':')[1],
          returnHour: formResponses?.[times.length]?.['returnHour'] ?? interval.items?.[i]?.returnTime?.split(':')[0],
          returnMinute:
            formResponses?.[times.length]?.['returnMinute'] ?? interval.items?.[i]?.returnTime?.split(':')[1],
        })
      }
    }

    return times
  }

  private mapOntoIntervals = (
    isSameTime: boolean,
    intervals: RotatingPatternInterval[],
    times: SchemaType['times'],
  ) => {
    if (isSameTime) {
      // If same time we'll only have one entry for day and night and need to replicate across intervals
      const dayReleaseTime = times.find(o => o.type === 'Scheduled days')!.releaseTime
      const nightReleaseTime = times.find(o => o.type === 'Scheduled nights')!.releaseTime
      const dayReturnTime = times.find(o => o.type === 'Scheduled days')!.returnTime
      const nightReturnTime = times.find(o => o.type === 'Scheduled nights')!.returnTime

      for (const interval of intervals.filter(o => this.timeTypes.includes(o.type))) {
        interval.items = []
        for (let i = 0; i < interval.count; i += 1) {
          interval.items.push({
            startTime: interval.type === 'Scheduled days' ? dayReleaseTime : nightReleaseTime,
            returnTime: interval.type === 'Scheduled days' ? dayReturnTime : nightReturnTime,
          })
        }
      }

      return
    }

    let timesIndex = -1
    for (const interval of intervals.filter(o => this.timeTypes.includes(o.type))) {
      interval.items = []
      for (let i = 0; i < interval.count; i += 1) {
        timesIndex += 1
        const time = times[timesIndex]
        if (!time) {
          throw new Error(`Failed to find entry in body for time ${timesIndex}`)
        }

        interval.items.push({
          startTime: time.releaseTime,
          returnTime: time.returnTime,
        })
      }
    }
  }

  GET = async (req: Request, res: Response) => {
    const rotatingPattern =
      req.journeyData.addTemporaryAbsence?.rotatingPatternSubJourney ??
      req.journeyData.addTemporaryAbsence?.rotatingPattern ??
      undefined
    const times = this.fromIntervals(
      rotatingPattern?.isSameTime ?? false,
      rotatingPattern?.intervals ?? [],
      res.locals.formResponses?.['times'] as Record<string, string>[],
    )
    res.render('add-temporary-absence/rotating-release-return-times/view', {
      times,
      backUrl: 'select-same-times',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const rotatingPattern = req.journeyData.addTemporaryAbsence?.rotatingPatternSubJourney
    this.mapOntoIntervals(rotatingPattern?.isSameTime ?? false, rotatingPattern!.intervals, req.body.times)
    req.journeyData.addTemporaryAbsence!.rotatingPattern = req.journeyData.addTemporaryAbsence!
      .rotatingPatternSubJourney as Required<AddTemporaryAbsenceJourney>['rotatingPattern']
    res.redirect('check-absences')
  }
}
