import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { SchemaType } from './schema'
import { absenceCategorisationMapper } from '../../../common/utils'

export class AbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/absence-type/view', {
      backUrl: `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails!.prisonerNumber}`,
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(absenceCategorisationMapper),
      absenceType:
        res.locals['formResponses']?.['absenceType'] ?? req.journeyData.addTemporaryAbsence!.absenceType?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.addTemporaryAbsence!.absenceType = req.body.absenceType

    if (!req.body.absenceType.nextDomain) {
      return res.redirect('single-or-repeating')
    }

    switch (req.body.absenceType.nextDomain) {
      case 'ABSENCE_SUB_TYPE':
        return res.redirect('absence-subtype')
      case 'ABSENCE_REASON_CATEGORY':
        return res.redirect('reason-category')
      case 'ABSENCE_REASON':
        return res.redirect('reason')
      default:
        throw new Error(`Unrecognised absence categorisation domain: ${req.body.absenceType.nextDomain}`)
    }
  }
}
