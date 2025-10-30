import { Request, Response } from 'express'
import { components } from '../../../@types/externalMovements'
import { ResQuerySchemaType } from './schema'
import { ManageTapAuthorisationBaseClass } from '../utils'

export class TapAuthorisationDetailsController extends ManageTapAuthorisationBaseClass {
  handleGet = async (
    authorisation: components['schemas']['TapAuthorisation'],
    _req: Request<{ id: string }>,
    res: Response,
  ) => {
    const { date, validated } = res.locals['query'] as ResQuerySchemaType
    res.render('temporary-absence-authorisations/details/view', {
      showBreadcrumbs: true,
      result: {
        ...authorisation,
        occurrences: validated
          ? authorisation.occurrences.filter(({ releaseAt }) => releaseAt.startsWith(validated.date))
          : authorisation.occurrences,
      },
      date,
    })
  }
}
