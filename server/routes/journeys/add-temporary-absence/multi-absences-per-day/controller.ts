import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'

export class MultiAbsencesPerDayController {
  GET = async (req: Request, res: Response) => {
    const { absencesPerDay, isMulti } = this.parseMultiAbsencesPerDay(
      req.journeyData.addTemporaryAbsence!.absencesPerDay,
    )

    res.render('add-temporary-absence/multi-absences-per-day/view', {
      backUrl: req.journeyData.addTemporaryAbsence!.isCheckPattern ? 'check-absences' : 'repeating-pattern',
      isMulti: res.locals.formResponses?.['isMulti'] ?? isMulti,
      absencesPerDay: res.locals.formResponses?.['absencesPerDay'] ?? absencesPerDay,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { absencesPerDay: req.body.absencesPerDay }))
  }

  private parseMultiAbsencesPerDay = (day: number | undefined) => {
    const absencesPerDay = day && day > 1 ? day : null
    if (day === undefined) {
      return { absencesPerDay, isMulti: null }
    }

    return {
      absencesPerDay,
      isMulti: day === 1 ? 'NO' : 'YES',
    }
  }
}
