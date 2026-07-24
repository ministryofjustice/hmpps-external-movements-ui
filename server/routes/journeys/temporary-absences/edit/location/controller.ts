import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { formatAddress } from '../../../../../utils/formatUtils'
import { SelectedLocationSchemaType } from './selected-location/schema'
import { SearchedAddressSchemaType } from '../../../add-temporary-absence/location/searched-address/schema'
import { EnteredAddressSchemaType } from '../../../add-temporary-absence/location/entered-address/schema'
import { AreaSchemaType } from '../../../add-temporary-absence/location/area/schema'
import { parseAddress } from '../../../../../utils/utils'
import { Address } from '../../../../../@types/journeys'

export class EditTapOccurrenceLocationController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, location, authorisation } = req.journeyData.updateTapOccurrence!

    const { locations } = await this.externalMovementsService.getTapLocations({ res })
    const locationOptions = locations.map((itm, idx) => ({ value: idx, text: formatAddress(itm) }))
    req.journeyData.updateTapOccurrence!.savedLocations = locations

    const selectedSavedLocation =
      location?.type === 'SAVED_LOCATION'
        ? locationOptions.find(({ text }) => formatAddress(location!) === text)?.value
        : undefined

    const enteredLocation = location?.type === 'ENTERED_ADDRESS' ? location : undefined

    res.render('temporary-absences/edit/location/view', {
      backUrl: authorisation.locations.length <= 1 ? backUrl : 'select-location',
      locations: locationOptions,
      uprn: location?.id ? String(location?.id) : null,
      inputValue: res.locals.formResponses?.['address-autosuggest-input'] ?? location?.address,
      description: res.locals.formResponses?.['description'] ?? enteredLocation?.description,
      line1: res.locals.formResponses?.['line1'] ?? enteredLocation?.line1,
      line2: res.locals.formResponses?.['line2'] ?? enteredLocation?.line2,
      city: res.locals.formResponses?.['city'] ?? enteredLocation?.city,
      county: res.locals.formResponses?.['county'] ?? enteredLocation?.county,
      postcode: res.locals.formResponses?.['postcode'] ?? enteredLocation?.postcode,
      area: res.locals.formResponses?.['area'] ?? (location?.type === 'ENTERED_AREA' ? location.address : null),
      selectedSavedLocation,
    })
  }

  postSelectedLocation = async (
    req: Request<unknown, unknown, SelectedLocationSchemaType>,
    res: Response,
    next: NextFunction,
  ) => this.saveLocationAndRedirect(req as Request, res, next, req.body.location)

  postSearchedAddress = async (
    req: Request<unknown, unknown, SearchedAddressSchemaType>,
    res: Response,
    next: NextFunction,
  ) =>
    this.saveLocationAndRedirect(req as Request, res, next, {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
    })

  postEnteredAddress = async (
    req: Request<unknown, unknown, EnteredAddressSchemaType>,
    res: Response,
    next: NextFunction,
  ) => this.saveLocationAndRedirect(req as Request, res, next, req.body)

  postArea = async (req: Request<unknown, unknown, AreaSchemaType>, res: Response, next: NextFunction) =>
    this.saveLocationAndRedirect(req as Request, res, next, { address: req.body.area })

  private saveLocationAndRedirect = async (req: Request, res: Response, next: NextFunction, location: Address) => {
    const journey = req.journeyData.updateTapOccurrence!

    try {
      journey.result = await this.externalMovementsService.updateTapOccurrence({ res }, journey.occurrence.id, {
        type: 'ChangeOccurrenceLocation',
        location: parseAddress(location),
      })
      req.journeyData.journeyCompleted = true
      res.redirect(journey.result!.content.length ? '../confirmation' : `/temporary-absences/${journey.occurrence.id}`)
    } catch (e) {
      next(e)
    }
  }
}
