import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { SearchLocationSchemaType } from './add-searched-address/schema'
import { parseAddress } from '../../utils/utils'
import { EnterNewLocationSchemaType } from './add-address/schema'
import { EnterAreaSchemaType } from './add-area/schema'
import { SortOrRemoveLocationSchemaType } from './sort-or-remove-location/schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../utils/constants'
import { formatAddress } from '../../utils/formatUtils'

export class ManageLocationsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const locationsResult = await this.externalMovementsService.getTapLocations({ res })
    res.render('manage-locations/view', {
      showBreadcrumbs: true,
      locations: locationsResult.locations,
      version: locationsResult.version,
      b64History: req.query['history'],
      uprn: res.locals.formResponses?.['uprn'],
      inputValue: res.locals.formResponses?.['address-autosuggest-input'],
      description: res.locals.formResponses?.['description'],
      line1: res.locals.formResponses?.['line1'],
      line2: res.locals.formResponses?.['line2'],
      city: res.locals.formResponses?.['city'],
      county: res.locals.formResponses?.['county'],
      postcode: res.locals.formResponses?.['postcode'],
      area: res.locals.formResponses?.['area'],
    })
  }

  postSearchedAddress = async (req: Request<unknown, unknown, SearchLocationSchemaType>, res: Response) => {
    const address = parseAddress({
      id: Number(req.body.address.uprn!),
      address: req.body.address.addressString ?? null,
      description: req.body.address.description,
      postcode: req.body.address.postcode,
    })
    await this.externalMovementsService.putTapLocations(
      { res },
      {
        version: req.body.version,
        locations: [...req.body.locations, address],
      },
    )
    req.flash(FLASH_KEY__SUCCESS_BANNER, `Location “${formatAddress(address)}” added.`)
    res.redirect('../manage-locations')
  }

  postEnteredAddress = async (req: Request<unknown, unknown, EnterNewLocationSchemaType>, res: Response) => {
    const address = parseAddress(req.body)
    await this.externalMovementsService.putTapLocations(
      { res },
      {
        version: req.body.version,
        locations: [...req.body.locations, address],
      },
    )
    req.flash(FLASH_KEY__SUCCESS_BANNER, `Location “${formatAddress(address)}” added.`)
    res.redirect('../manage-locations')
  }

  postArea = async (req: Request<unknown, unknown, EnterAreaSchemaType>, res: Response) => {
    await this.externalMovementsService.putTapLocations(
      { res },
      {
        version: req.body.version,
        locations: [...req.body.locations, { address: req.body.area }],
      },
    )
    req.flash(FLASH_KEY__SUCCESS_BANNER, `Location “${req.body.area}” added.`)
    res.redirect('../manage-locations')
  }

  postSortOrRemoveLocation = async (req: Request<unknown, unknown, SortOrRemoveLocationSchemaType>, res: Response) => {
    if (req.body.remove !== null) {
      await this.externalMovementsService.putTapLocations(
        { res },
        {
          version: req.body.version,
          locations: req.body.locations.filter((_, idx) => idx !== req.body.remove),
        },
      )
      req.flash(FLASH_KEY__SUCCESS_BANNER, `Location “${formatAddress(req.body.locations[req.body.remove]!)}” removed.`)
    } else {
      await this.externalMovementsService.putTapLocations(
        { res },
        {
          version: req.body.version,
          locations: req.body.order.map(idx => req.body.locations[idx]!),
        },
      )
      req.flash(FLASH_KEY__SUCCESS_BANNER, `Locations sort order updated.`)
    }
    res.redirect('../manage-locations')
  }
}
