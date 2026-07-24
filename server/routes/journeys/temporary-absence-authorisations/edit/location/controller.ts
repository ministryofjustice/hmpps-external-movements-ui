import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { formatAddress } from '../../../../../utils/formatUtils'
import { SelectedLocationSchemaType } from './selected-location/schema'
import { SearchedAddressSchemaType } from '../../../add-temporary-absence/location/searched-address/schema'
import { EnteredAddressSchemaType } from '../../../add-temporary-absence/location/entered-address/schema'
import { AreaSchemaType } from '../../../add-temporary-absence/location/area/schema'

export class EditTapAuthorisationLocationController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, location } = req.journeyData.updateTapAuthorisation!

    const { locations } = await this.externalMovementsService.getTapLocations({ res })
    const locationOptions = locations.map((itm, idx) => ({ value: idx, text: formatAddress(itm) }))
    req.journeyData.updateTapAuthorisation!.savedLocations = locations

    const selectedSavedLocation =
      location?.type === 'SAVED_LOCATION'
        ? locationOptions.find(({ text }) => formatAddress(location!) === text)?.value
        : undefined

    const enteredLocation = location?.type === 'ENTERED_ADDRESS' ? location : undefined

    res.render('temporary-absence-authorisations/edit/location/view', {
      backUrl,
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

  postSelectedLocation = async (req: Request<unknown, unknown, SelectedLocationSchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.location = { ...req.body.location, type: 'SAVED_LOCATION' }
    res.redirect('../change-confirmation')
  }

  postSearchedAddress = async (req: Request<unknown, unknown, SearchedAddressSchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.location = {
      id: Number(req.body.uprn!),
      address: req.body.addressString ?? null,
      description: req.body.description,
      postcode: req.body.postcode,
      type: 'SEARCHED_ADDRESS',
    }
    res.redirect('../change-confirmation')
  }

  postEnteredAddress = async (req: Request<unknown, unknown, EnteredAddressSchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.location = { ...req.body, type: 'ENTERED_ADDRESS' }
    res.redirect('../change-confirmation')
  }

  postArea = async (req: Request<unknown, unknown, AreaSchemaType>, res: Response) => {
    req.journeyData.updateTapAuthorisation!.location = { address: req.body.area, type: 'ENTERED_AREA' }
    res.redirect('../change-confirmation')
  }
}
