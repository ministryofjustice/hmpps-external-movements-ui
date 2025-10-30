import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { SchemaType } from './schema'

export class SearchLocationsController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/search-locations/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'check-absences'),
      inputValue: res.locals.formResponses?.['address-autosuggest-input'],
      locations: req.journeyData.addTemporaryAbsence!.locations ?? [],
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.body.add !== undefined) {
      req.journeyData.addTemporaryAbsence!.locations ??= []
      req.journeyData.addTemporaryAbsence!.locations.push({
        id: req.body.uprn,
        description: req.body.addressString ?? null,
      })

      res.redirect('search-locations')
    } else {
      res.redirect('match-absences-and-locations')
    }
  }

  remove = async (req: Request<{ itm: string }>, res: Response) => {
    const itm = Number(req.params.itm)
    if (!Number.isNaN(itm)) {
      req.journeyData.addTemporaryAbsence!.locations?.splice(itm - 1, 1)
    }
    res.redirect('../../search-locations')
  }
}
