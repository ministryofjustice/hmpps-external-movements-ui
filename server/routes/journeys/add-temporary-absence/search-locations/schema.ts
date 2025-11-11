import { z } from 'zod'
import { Request } from 'express'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Enter and select an address or postcode'

export const schemaFactory = (osPlacesAddressService: OsPlacesAddressService) => async (req: Request) =>
  createSchema({
    'address-autosuggest-input': z.string(),
    uprn: z.string().optional(),
    add: z.string().optional(),
    save: z.string().optional(),
  }).transform(async (val, ctx) => {
    if (val.save !== undefined) {
      if (req.journeyData.addTemporaryAbsence!.locations?.length) {
        return {
          ...val,
          uprn: '',
          addressString: '',
        }
      }
      ctx.addIssue({ code: 'custom', message: ERROR_MSG, path: ['address-autosuggest-input'] })
      return z.NEVER
    }

    const address = val.uprn ? await osPlacesAddressService.getAddressByUprn(val.uprn) : null

    if (!address) {
      ctx.addIssue({ code: 'custom', message: ERROR_MSG, path: ['address-autosuggest-input'] })
      return z.NEVER
    }

    if (req.journeyData.addTemporaryAbsence!.locations?.find(itm => itm.id === val.uprn)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter and select an address that has not been already added',
        path: ['address-autosuggest-input'],
      })
      return z.NEVER
    }

    return {
      ...val,
      uprn: val.uprn!,
      addressString: address.addressString,
    }
  })

export type SchemaType = z.infer<Awaited<ReturnType<Awaited<ReturnType<typeof schemaFactory>>>>>
