import { Request, Response } from 'express'
import { AddTapFlowControl } from '../flow'
import { getOccurrencesToMatch } from '../utils'
import { formatAddress } from '../../../../utils/formatUtils'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SelectedLocationSchemaType } from '../location/selected-location/schema'
import { SearchedAddressSchemaType } from '../location/searched-address/schema'
import { EnteredAddressSchemaType } from '../location/entered-address/schema'
import { AreaSchemaType } from '../location/area/schema'
import { Address } from '../../../../@types/journeys'

export class SearchLocationsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { locations } = await this.externalMovementsService.getTapLocations({ res })
    const locationOptions = locations.map((itm, idx) => ({ value: idx, text: formatAddress(itm) }))
    req.journeyData.addTemporaryAbsence!.savedLocations = locations

    res.render('add-temporary-absence/search-locations/view', {
      backUrl: AddTapFlowControl.getBackUrl(req, 'check-absences'),
      inputValue: res.locals.formResponses?.['address-autosuggest-input'],
      uprn: res.locals.formResponses?.['uprn'],
      locations: req.journeyData.addTemporaryAbsence!.locations ?? [],
      locationOptions,
      description: res.locals.formResponses?.['description'],
      line1: res.locals.formResponses?.['line1'],
      line2: res.locals.formResponses?.['line2'],
      city: res.locals.formResponses?.['city'],
      county: res.locals.formResponses?.['county'],
      postcode: res.locals.formResponses?.['postcode'],
    })
  }

  POST = async (req: Request, res: Response) => {
    if (req.journeyData.isCheckAnswers) {
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

  private addLocation = async (req: Request, res: Response, location: Address) => {
    // break check-answers bounce back routing if locations are changed
    delete req.journeyData.isCheckAnswers

    req.journeyData.addTemporaryAbsence!.locations ??= []
    req.journeyData.addTemporaryAbsence!.locations.push(location)
    res.redirect('../search-locations')
  }

  postSelectedLocation = async (req: Request<unknown, unknown, SelectedLocationSchemaType>, res: Response) =>
    this.addLocation(req as Request, res, req.body.location)

  postSearchedAddress = async (req: Request<unknown, unknown, SearchedAddressSchemaType>, res: Response) =>
    this.addLocation(req as Request, res, {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
    })

  postEnteredAddress = async (req: Request<unknown, unknown, EnteredAddressSchemaType>, res: Response) =>
    this.addLocation(req as Request, res, req.body)

  postArea = async (req: Request<unknown, unknown, AreaSchemaType>, res: Response) =>
    this.addLocation(req as Request, res, { address: req.body.area })

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
