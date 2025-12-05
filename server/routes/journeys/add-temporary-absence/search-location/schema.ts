import { z } from 'zod'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Enter and select an address or postcode'

export const schemaFactory = (osPlacesAddressService: OsPlacesAddressService) =>
  createSchema({
    'address-autosuggest-input': z.string(),
    uprn: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    postcode: z.string().optional(),
  }).transform(async ({ uprn, line1, line2, city, county, postcode, ...val }, ctx) => {
    const address =
      val['address-autosuggest-input'] && uprn ? await osPlacesAddressService.getAddressByUprn(uprn) : null

    if (address) {
      return {
        isManual: false,
        uprn: uprn!,
        addressString: address.addressString,
        postcode: address.postcode,
        description: address.subBuildingName,
      }
    }

    if (line1 || line2 || city || county || postcode) {
      if (city) {
        return {
          isManual: true,
          line1: line1?.trim() ? line1 : null,
          line2: line2?.trim() ? line2 : null,
          city,
          county: county?.trim() ? county : null,
          postcode: postcode?.trim() ? postcode : null,
          description: null,
        }
      }

      ctx.addIssue({ code: 'custom', message: 'Enter town or city', path: ['city'] })
      return z.NEVER
    }

    ctx.addIssue({ code: 'custom', message: ERROR_MSG, path: ['address-autosuggest-input'] })
    return z.NEVER
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
