import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { formatAddress } from '../../../../../utils/formatUtils'
import { SearchedAddressSchemaType } from './searched-address/schema'
import { EnteredAddressSchemaType } from './entered-address/schema'
import { AreaSchemaType } from './area/schema'
import { SelectedLocationSchemaType } from './selected-location/schema'

export class AddTapOccurrenceLocationController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { location } = req.journeyData.addTapOccurrence!

    const { locations } = await this.externalMovementsService.getTapLocations({ res })

    req.journeyData.addTapOccurrence!.savedLocations = locations

    res.render('temporary-absence-authorisations/add-occurrence/location/view', {
      backUrl: 'select-location',
      b64History: req.query['history'],
      locations: locations.map((itm, idx) => ({ value: idx, text: formatAddress(itm) })),
      uprn: location?.id ? String(location?.id) : null,
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.address,
      description: res.locals.formResponses?.['description'],
      line1: res.locals.formResponses?.['line1'],
      line2: res.locals.formResponses?.['line2'],
      city: res.locals.formResponses?.['city'],
      county: res.locals.formResponses?.['county'],
      postcode: res.locals.formResponses?.['postcode'],
      area: res.locals.formResponses?.['area'],
    })
  }

  postSelectedLocation = async (req: Request<unknown, unknown, SelectedLocationSchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.location = req.body.location
    res.redirect(req.journeyData.isCheckAnswers ? '../check-answers' : '../comments')
  }

  postSearchedAddress = async (req: Request<unknown, unknown, SearchedAddressSchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.location = {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
    }
    res.redirect(req.journeyData.isCheckAnswers ? '../check-answers' : '../comments')
  }

  postEnteredAddress = async (req: Request<unknown, unknown, EnteredAddressSchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.location = req.body
    res.redirect(req.journeyData.isCheckAnswers ? '../check-answers' : '../comments')
  }

  postArea = async (req: Request<unknown, unknown, AreaSchemaType>, res: Response) => {
    req.journeyData.addTapOccurrence!.location = { address: req.body.area }
    res.redirect(req.journeyData.isCheckAnswers ? '../check-answers' : '../comments')
  }
}
