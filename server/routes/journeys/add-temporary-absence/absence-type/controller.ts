import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/externalMovementsApi/externalMovementsService'

export class AbsenceTypeController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('add-temporary-absence/absence-type/view', {
      backUrl: `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails!.prisonerNumber}`,
      options: (await this.externalMovementsService.getAllAbsenceTypes({ res })).items.map(
        ({ code, description, hintText }) => ({
          value: code,
          text: description,
          hint: hintText ? { text: hintText } : undefined,
        }),
      ),
      absenceType:
        res.locals['formResponses']?.['absenceType'] ?? req.journeyData!.addTemporaryAbsence!.absenceType?.code,
    })
  }
}
