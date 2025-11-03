import { NextFunction, Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { components } from '../../../../@types/externalMovements'
import { Address } from '../../../../@types/journeys'

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
        occurrences: repeat
          ? occurrences!.map(({ releaseAt, returnBy, locationIdx }) => ({
              releaseAt,
              returnBy,
              location: parseAddress(locations![locationIdx]!),
              transportCode: transport!.code,
              accompaniedByCode: accompanied && accompaniedBy ? accompaniedBy.code : 'U',
            }))
          : [
              {
                releaseAt: `${startDate}T${startTime}:00`,
                returnBy: `${returnDate}T${returnTime}:00`,
                location: parseAddress(location!),
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
        for (const occurrence of request.occurrences) {
          occurrence.notes = notes
        }
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

const parseAddress = (location: Address) => ({
  description: location.description!,
  ...(location.id ? { uprn: location.id } : {}),
  ...(location.postcode ? { postcode: location.postcode } : {}),
})
