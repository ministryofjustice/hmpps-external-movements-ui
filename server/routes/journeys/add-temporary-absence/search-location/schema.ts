import { z } from 'zod'
import { Request } from 'express'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import CustomOsPlacesAddressService from '../../../../services/apis/osPlacesAddressService'

const ERROR_MSG = 'Enter and select an address or postcode'

export const schemaFactory = (osPlacesAddressService: CustomOsPlacesAddressService) => async (req: Request) =>
  createSchema({
    'address-autosuggest-input': z.string({ message: ERROR_MSG }).min(1, { message: ERROR_MSG }),
    uprn: z.string().optional(),
  }).transform(async (val, ctx) => {
    const address = val.uprn ? await osPlacesAddressService.getAddressByUprn(val.uprn) : null

    if (
      req.journeyData.addTemporaryAbsence!.location?.id &&
      req.journeyData.addTemporaryAbsence!.location?.description === val['address-autosuggest-input']
    ) {
      return {
        ...val,
        uprn: req.journeyData.addTemporaryAbsence!.location.id,
        addressString: req.journeyData.addTemporaryAbsence!.location.description,
      }
    }

    if (!address) {
      ctx.addIssue({ code: 'custom', message: ERROR_MSG, path: ['address-autosuggest-input'] })
      return z.NEVER
    }

    return {
      ...val,
      uprn: val.uprn!,
      addressString: address.addressString,
    }
  })

export type SchemaType = z.infer<Awaited<ReturnType<Awaited<ReturnType<typeof schemaFactory>>>>>
