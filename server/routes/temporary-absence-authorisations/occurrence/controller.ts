import { Request, Response } from 'express'
import { components } from '../../../@types/externalMovements'
import { ManageTapAuthorisationBaseClass } from '../utils'

export class TapOccurrenceDetailsController extends ManageTapAuthorisationBaseClass {
  handleGet = async (
    authorisation: components['schemas']['TapAuthorisation'],
    req: Request<{ id: string; occurrenceId: string }>,
    res: Response,
  ) => {
    res.render('temporary-absence-authorisations/occurrence/view', {
      showBreadcrumbs: true,
      result: authorisation,
      occurrence: authorisation.occurrences.find(({ id }) => req.params.occurrenceId === id),
    })
  }
}
