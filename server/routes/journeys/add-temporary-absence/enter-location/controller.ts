import { Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import { SchemaType } from './schema'
import { AddTapFlowControl } from '../flow'
import { ADDRESS_REFERENCE_DATA } from '../../../../data/address'

export class EnterLocationController {
  GET = async (req: Request, res: Response) => {
    const address =
      req.journeyData.addTemporaryAbsence!.confirmLocationSubJourney?.location ??
      req.journeyData.addTemporaryAbsence!.location

    res.render('add-temporary-absence/enter-location/view', {
      backUrl: 'search-location',
      cityOptions: getOptions(ADDRESS_REFERENCE_DATA.CITY),
      countyOptions: getOptions(ADDRESS_REFERENCE_DATA.COUNTY),
      countryOptions: getOptions(ADDRESS_REFERENCE_DATA.COUNTRY),
      flat: res.locals.formResponses?.['flat'] ?? address?.flat,
      property: res.locals.formResponses?.['property'] ?? address?.property,
      street: res.locals.formResponses?.['street'] ?? address?.street,
      area: res.locals.formResponses?.['area'] ?? address?.area,
      city: res.locals.formResponses?.['cityText'] ?? address?.cityDescription,
      county: res.locals.formResponses?.['countyText'] ?? address?.countyDescription,
      postcode: res.locals.formResponses?.['postcode'] ?? address?.postcode,
      country: res.locals.formResponses?.['countryText'] ?? address?.countryDescription,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(
      AddTapFlowControl.saveDataAndGetNextPage(req, {
        location: {
          id: `manual-${uuidV4()}`,
          flat: req.body.flat,
          property: req.body.property,
          street: req.body.street,
          area: req.body.area,
          cityDescription: req.body.cityText,
          countyDescription: req.body.countyText,
          postcode: req.body.postcode,
          countryDescription: req.body.countryText,
        },
      }),
    )
  }
}

const getOptions = (refData: { description: string }[]) => [
  {
    value: '',
    text: '',
  },
  ...refData.map(mapRefData),
]

const mapRefData = ({ description }: { description: string }) => ({
  value: description,
  text: description,
})
