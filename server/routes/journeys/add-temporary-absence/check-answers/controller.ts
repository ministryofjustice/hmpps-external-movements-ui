import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { components } from '../../../../@types/externalMovements'

export class AddTapCheckAnswersController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.addTemporaryAbsence!.categorySubJourney
    delete req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney
    delete req.journeyData.addTemporaryAbsence!.locationSubJourney
    delete req.journeyData.addTemporaryAbsence!.accompaniedSubJourney

    res.render('add-temporary-absence/check-answers/view', {
      backUrl: 'approval',
      ...req.journeyData.addTemporaryAbsence!,
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const {
      absenceType,
      absenceSubType,
      reason,
      startDate,
      startTime,
      returnDate,
      returnTime,
      accompanied,
      accompaniedBy,
      transport,
      notes,
      locationType,
      location,
      repeat,
      requireApproval,
    } = req.journeyData.addTemporaryAbsence!

    try {
      const request: components['schemas']['CreateTapSeriesRequest'] = {
        submittedAt: new Date().toISOString(),
        repeat: repeat!,
        statusCode: requireApproval ? 'PEN' : 'APP-SCH',
        absenceTypeCode: absenceType!.code,
        releaseAt: `${startDate}T${startTime}:00`,
        returnBy: `${returnDate}T${returnTime}:00`,
        accompanied: accompanied!,
        locationTypeCode: locationType!.code,
        locationId: location!.id,
      }

      if (absenceSubType) request.absenceSubTypeCode = absenceSubType.code
      if (reason) request.absenceReasonCode = reason.code
      if (accompanied && accompaniedBy) request.accompaniedByCode = accompaniedBy.code
      if (transport) request.transportCode = transport.code
      if (notes) request.notes = notes

      await this.externalMovementsService.createTap({ res }, req.journeyData.prisonerDetails!.prisonerNumber, request)
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = (_req: Request, res: Response) => res.redirect('confirmation')
}
