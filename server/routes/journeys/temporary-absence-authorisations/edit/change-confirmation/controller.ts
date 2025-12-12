import { NextFunction, Request, Response } from 'express'
import { formatAddress, joinAddress } from '../../../../../utils/formatUtils'
import { getUpdateAbsenceCategoryRequest } from '../utils'
import ExternalMovementsService, { UpdateTapAuthorisation } from '../../../../../services/apis/externalMovementsService'
import { parseAddress } from '../../../../../utils/utils'

export class EditTapAuthorisationChangeConfirmationController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    const {
      authorisation,
      absenceType,
      absenceSubType,
      reason,
      reasonCategory,
      comments,
      location,
      transport,
      accompanied,
      accompaniedBy,
    } = req.journeyData.updateTapAuthorisation!

    let fieldName = ''
    let previousValue = ''
    let newValue = ''

    if (absenceType || absenceSubType || reason || reasonCategory) {
      fieldName = 'categorisation'

      previousValue = [
        authorisation.absenceType,
        authorisation.absenceSubType,
        authorisation.absenceReasonCategory,
        authorisation.absenceReason,
      ]
        .filter(itm => Boolean(itm))
        .map(itm => itm?.description)
        .join(' - ')

      newValue = [absenceType, absenceSubType, reasonCategory, reason]
        .filter(itm => Boolean(itm))
        .map(itm => itm?.description)
        .join(' - ')
    } else if (comments !== undefined) {
      fieldName = 'relevant comments'
      previousValue = authorisation.comments ? `“${authorisation.comments}”` : 'Not applicable'
      newValue = comments ? `“${comments}”` : 'Not applicable'
    } else if (transport) {
      fieldName = 'transport'
      previousValue = authorisation.transport.description
      newValue = transport.description
    } else if (location) {
      fieldName = 'location'
      previousValue = formatAddress(authorisation.locations[0]!)
      newValue = joinAddress(location)
    } else if (accompanied !== undefined || accompaniedBy) {
      fieldName = 'escort'
      previousValue = authorisation.accompaniedBy.description
      newValue = accompaniedBy?.description || 'Unaccompanied'
    }

    res.render('temporary-absence-authorisations/edit/change-confirmation/view', {
      goBackUrl: `/temporary-absence-authorisations/${authorisation.id}`,
      repeat: authorisation.repeat,
      fieldName,
      previousValue,
      newValue,
    })
  }

  POST = async (req: Request, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTapAuthorisation!

    const {
      absenceType,
      absenceSubType,
      reason,
      reasonCategory,
      comments,
      location,
      transport,
      accompanied,
      accompaniedBy,
    } = journey

    try {
      if (location) {
        journey.result = await this.externalMovementsService.updateTapOccurrence(
          { res },
          journey.authorisation.occurrences[0]!.id,
          {
            type: 'ChangeOccurrenceLocation',
            location: parseAddress(location),
          },
        )
      } else {
        let requestBody: UpdateTapAuthorisation
        if (absenceType || absenceSubType || reason || reasonCategory) {
          requestBody = getUpdateAbsenceCategoryRequest(req)
        } else if (comments !== undefined) {
          requestBody = {
            type: 'ChangeAuthorisationComments',
            comments: comments ?? '',
          }
        } else if (transport) {
          requestBody = {
            type: 'ChangeAuthorisationTransport',
            transportCode: transport.code,
          }
        } else if (accompanied !== undefined || accompaniedBy) {
          requestBody = {
            type: 'ChangeAuthorisationAccompaniment',
            accompaniedByCode: accompaniedBy?.code || 'U',
          }
        }

        journey.result = await this.externalMovementsService.updateTapAuthorisation(
          { res },
          journey.authorisation.id,
          requestBody!,
        )
      }

      res.redirect(
        journey.result?.content.length
          ? 'confirmation'
          : `/temporary-absence-authorisations/${journey.authorisation.id}`,
      )
    } catch (e) {
      next(e)
    }
  }
}
