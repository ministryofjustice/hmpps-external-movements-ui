import { z } from 'zod'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Enter and select an address or postcode'

export const schemaFactory = (osPlacesAddressService: OsPlacesAddressService) =>
  createSchema({
    'address-autosuggest-input': z.string(),
    uprn: z.string().optional(),
  }).transform(async ({ uprn, ...val }, ctx) => {
    const address =
      val['address-autosuggest-input'] && uprn
        ? await osPlacesAddressService.getAddressByUprn(uprn, { osPlacesQueryParamOverrides: { dataset: 'LPI' } })
        : null

    if (address) {
      return {
        uprn: uprn!,
        addressString: address.addressString,
        postcode: address.postcode,
        description: address.organisationName,
      }
    }

    ctx.addIssue({ code: 'custom', message: ERROR_MSG, path: ['address-autosuggest-input'] })
    return z.NEVER
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
