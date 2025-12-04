import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class AddTapOccurrenceSelectLocationController {
  GET = async (req: Request, res: Response) => {
    const { authorisation, locationOption } = req.journeyData.addTapOccurrence!

    res.render('temporary-absence-authorisations/add-occurrence/select-location/view', {
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : '../add-occurrence',
      authorisation,
      locationOption: locationOption !== undefined ? String(locationOption) : null,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.locationOption = req.body.locationOption

    if (req.journeyData.isCheckAnswers && req.body.locationOption !== 'NEW') {
      res.redirect('check-answers')
    } else {
      res.redirect(req.body.locationOption === 'NEW' ? 'search-location' : 'comments')
    }
  }
}
