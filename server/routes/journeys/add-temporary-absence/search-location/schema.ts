import { z } from 'zod'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Enter or select an address'

export const schemaFactory = (osPlacesAddressService: OsPlacesAddressService) =>
  createSchema({
    'address-autosuggest-input': z.string({ message: ERROR_MSG }).min(1, { message: ERROR_MSG }),
    uprn: z.string().optional(),
  }).transform(async val => {
    const address = val.uprn ? await osPlacesAddressService.getAddressByUprn(val.uprn) : null

    return {
      ...val,
      uprn: address ? val.uprn! : undefined,
      addressText: val['address-autosuggest-input'],
      address,
    }
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
