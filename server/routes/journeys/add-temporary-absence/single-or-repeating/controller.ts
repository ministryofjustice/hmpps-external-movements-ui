import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { getAbsenceCategoryBackUrl } from '../../../common/utils'
import { AddTapFlowControl } from '../flow'

export class SingleOrRepeatingController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/single-or-repeating/view', {
      backUrl: getAbsenceCategoryBackUrl(req, null),
      repeat: res.locals['formResponses']?.['repeat'] ?? req.journeyData.addTemporaryAbsence!.repeat,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(AddTapFlowControl.saveDataAndGetNextPage(req, { repeat: req.body.repeat }))
  }
}
