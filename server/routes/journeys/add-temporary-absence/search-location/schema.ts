import { z } from 'zod'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERR_MSG = `Find and select an address`

export const schemaFactory = (osPlacesAddressService: OsPlacesAddressService) =>
  createSchema({
    'address-autosuggest-input': z.string().optional(),
    uprn: z.string().optional(),
  }).transform(async (val, ctx) => {
    const address = val.uprn && (await osPlacesAddressService.getAddressByUprn(val.uprn))
    if (!address) {
      ctx.addIssue({ code: 'custom', message: ERR_MSG, path: ['address-autosuggest-input'] })
      return z.NEVER
    }

    return {
      ...val,
      uprn: val.uprn!,
      address,
    }
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
