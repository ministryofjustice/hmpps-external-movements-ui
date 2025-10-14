import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { components } from '../../../../@types/externalMovements'

export class AddTapCheckAnswersController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.addTemporaryAbsence!.categorySubJourney
    delete req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney
    delete req.journeyData.addTemporaryAbsence!.confirmLocationSubJourney
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
      reasonCategory,
      reason,
      startDate,
      startTime,
      returnDate,
      returnTime,
      accompanied,
      accompaniedBy,
      transport,
      notes,
      location,
      repeat,
      requireApproval,
    } = req.journeyData.addTemporaryAbsence!

    try {
      const request: components['schemas']['CreateTapAuthorisationRequest'] = {
        submittedAt: new Date().toISOString(),
        repeat: repeat!,
        statusCode: requireApproval ? 'PENDING' : 'APPROVED',
        absenceTypeCode: absenceType!.code,
        fromDate: `${startDate}T${startTime}:00`,
        toDate: `${returnDate}T${returnTime}:00`,
        occurrences: [
          {
            releaseAt: `${startDate}T${startTime}:00`,
            returnBy: `${returnDate}T${returnTime}:00`,
            locationTypeCode: 'CORP',
            locationId: location!.id,
            transportCode: transport!.code,
            accompaniedByCode: accompanied && accompaniedBy ? accompaniedBy.code : 'U',
          },
        ],
      }

      if (absenceSubType) request.absenceSubTypeCode = absenceSubType.code
      if (reason) {
        request.absenceReasonCode = reason.code
      } else if (reasonCategory) {
        request.absenceReasonCode = reasonCategory.code
      }

      if (notes) {
        request.notes = notes
        request.occurrences[0]!.notes = notes
      }

      await this.externalMovementsService.createTap({ res }, req.journeyData.prisonerDetails!.prisonerNumber, request)
      req.journeyData.journeyCompleted = true
      delete req.journeyData.addTemporaryAbsence
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = (_req: Request, res: Response) => res.redirect('confirmation')
}
