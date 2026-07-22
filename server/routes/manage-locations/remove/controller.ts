import { Request, Response } from 'express'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER, FLASH_KEY__VALIDATION_ERRORS } from '../../../utils/constants'
import { formatAddress } from '../../../utils/formatUtils'
import { INVALID_LOCATIONS_VERSION_MSG } from '../constants'

export class RemoveLocationController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<unknown, unknown, unknown, { version?: string; idx?: string }>, res: Response) => {
    const backUrl = `../manage-locations`

    if (!req.query.idx || Number.isNaN(Number(req.query.idx))) {
      req.flash(FLASH_KEY__VALIDATION_ERRORS, INVALID_LOCATIONS_VERSION_MSG)
      return res.redirect(backUrl)
    }
    const locationsResult = await this.externalMovementsService.getTapLocations({ res })
    if (locationsResult.version !== req.query.version) {
      req.flash(FLASH_KEY__VALIDATION_ERRORS, INVALID_LOCATIONS_VERSION_MSG)
      return res.redirect(backUrl)
    }

    return res.render('manage-locations/remove/view', {
      backUrl,
      locations: locationsResult.locations,
      version: locationsResult.version,
      remove: Number(req.query.idx),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.body.confirm) {
      await this.externalMovementsService.putTapLocations(
        { res },
        {
          version: req.body.version,
          locations: req.body.locations.filter((_, idx) => idx !== req.body.remove),
        },
      )
      req.flash(FLASH_KEY__SUCCESS_BANNER, `Location “${formatAddress(req.body.locations[req.body.remove]!)}” removed.`)
    }

    res.redirect(`../manage-locations`)
  }
}
