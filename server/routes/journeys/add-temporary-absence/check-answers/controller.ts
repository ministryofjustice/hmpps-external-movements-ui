import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { components } from '../../../../@types/externalMovements'
import { parseAddress } from '../../../../utils/utils'

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
      locations,
      occurrences,
      fromDate,
      toDate,
    } = req.journeyData.addTemporaryAbsence!

    try {
      const request: components['schemas']['CreateTapAuthorisationRequest'] = {
        repeat: repeat!,
        statusCode: requireApproval ? 'PENDING' : 'APPROVED',
        absenceTypeCode: absenceType!.code,
        fromDate: repeat ? fromDate! : startDate!,
        toDate: repeat ? toDate! : returnDate!,
        accompaniedByCode: accompanied && accompaniedBy ? accompaniedBy.code : 'U',
        transportCode: transport!.code,
        occurrences: repeat
          ? occurrences!.map(({ releaseAt, returnBy, locationIdx }) => ({
              releaseAt,
              returnBy,
              location: parseAddress(locations![locationIdx]!),
            }))
          : [
              {
                releaseAt: `${startDate}T${startTime}:00`,
                returnBy: `${returnDate}T${returnTime}:00`,
                location: parseAddress(location!),
              },
            ],
      }

      if (absenceSubType) request.absenceSubTypeCode = absenceSubType.code
      if (reasonCategory) request.absenceReasonCategoryCode = reasonCategory.code
      if (reason) request.absenceReasonCode = reason.code

      if (notes) {
        request.notes = notes
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
