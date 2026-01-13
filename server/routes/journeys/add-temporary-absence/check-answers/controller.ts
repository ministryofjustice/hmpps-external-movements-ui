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
    delete req.journeyData.addTemporaryAbsence!.accompaniedSubJourney

    res.render('add-temporary-absence/check-answers/view', {
      ...req.journeyData.addTemporaryAbsence!,
      backUrl: 'approval',
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
      comments,
      location,
      repeat,
      requireApproval,
      locations,
      occurrences,
      start,
      end,
      ...journeyData
    } = req.journeyData.addTemporaryAbsence!

    try {
      const request: components['schemas']['CreateTapAuthorisationRequest'] = {
        repeat: repeat!,
        statusCode: requireApproval ? 'PENDING' : 'APPROVED',
        absenceTypeCode: absenceType!.code,
        start: repeat ? start! : startDate!,
        end: repeat ? end! : returnDate!,
        accompaniedByCode: accompanied && accompaniedBy ? accompaniedBy.code : 'U',
        transportCode: transport!.code,
        occurrences: repeat
          ? occurrences!.map(occurrence => ({
              start: occurrence.start,
              end: occurrence.end,
              location: parseAddress(locations![occurrence.locationIdx]!),
              scheduleReference: { type: journeyData.patternType },
            }))
          : [
              {
                start: `${startDate}T${startTime}:00`,
                end: `${returnDate}T${returnTime}:00`,
                location: parseAddress(location!),
              },
            ],
      }

      if (absenceSubType) request.absenceSubTypeCode = absenceSubType.code
      if (reasonCategory) request.absenceReasonCategoryCode = reasonCategory.code
      if (reason) request.absenceReasonCode = reason.code
      if (comments) {
        request.comments = comments
      }
      if (repeat) {
        request.schedule = {
          type: journeyData.patternType,
          weeklyPattern: journeyData.weeklyPattern,
          biweeklyPattern: journeyData.biweeklyPattern,
          shiftPattern: journeyData.shiftPattern,
        }
      }

      await this.externalMovementsService.createTap({ res }, req.journeyData.prisonerDetails!.prisonerNumber, request)
      req.journeyData.journeyCompleted = true
      req.journeyData.addTemporaryAbsence = { historyQuery: req.journeyData.addTemporaryAbsence!.historyQuery! }
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = (_req: Request, res: Response) => res.redirect('confirmation')
}
