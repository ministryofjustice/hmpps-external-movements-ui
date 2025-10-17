import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import CustomOsPlacesAddressService from '../../../../services/apis/osPlacesAddressService'

const ERROR_MSG = 'Enter or select an address'

export const schemaFactory = (osPlacesAddressService: CustomOsPlacesAddressService) =>
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
