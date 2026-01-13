import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { SchemaType } from './schema'
import { getOccurrencesToMatch } from '../utils'

export class SearchLocationsController {
  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/search-locations/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'check-absences'),
      inputValue: res.locals.formResponses?.['address-autosuggest-input'],
      uprn: res.locals.formResponses?.['uprn'],
      locations: req.journeyData.addTemporaryAbsence!.locations ?? [],
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.body.add !== undefined) {
      // break check-answers bounce back routing if locations are changed
      delete req.journeyData.isCheckAnswers

      req.journeyData.addTemporaryAbsence!.locations ??= []
      req.journeyData.addTemporaryAbsence!.locations.push({
        id: Number(req.body.uprn),
        address: req.body.addressString ?? null,
        description: req.body.description,
        postcode: req.body.postcode,
      })

      res.redirect('search-locations')
    } else if (req.journeyData.isCheckAnswers) {
      res.redirect('check-answers')
    } else if (req.journeyData.addTemporaryAbsence!.locations?.length === 1) {
      req.journeyData.addTemporaryAbsence!.occurrences = getOccurrencesToMatch(req).map(({ start, end }) => ({
        start,
        end,
        locationIdx: 0,
      }))
      res.redirect('accompanied-or-unaccompanied')
    } else {
      res.redirect('match-absences-and-locations')
    }
  }

  remove = async (req: Request<{ itm: string }>, res: Response) => {
    const itm = Number(req.params.itm)
    if (!Number.isNaN(itm)) {
      // break check-answers bounce back routing if locations are changed
      delete req.journeyData.isCheckAnswers

      req.journeyData.addTemporaryAbsence!.locations?.splice(itm - 1, 1)
      delete req.journeyData.addTemporaryAbsence!.occurrences
    }
    res.redirect('../../search-locations')
  }
}
