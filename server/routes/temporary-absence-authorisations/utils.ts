import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { components } from '../../@types/externalMovements'

export const getAuthorisationAndPopulatePrisonerDetails = async (
  externalMovementsService: ExternalMovementsService,
  req: Request<{ id: string }>,
  res: Response,
  start?: string | null,
  end?: string | null,
) => {
  const result = await externalMovementsService.getTapAuthorisation({ res }, req.params.id, start, end)
  res.locals.prisonerDetails = {
    prisonerNumber: result.person.personIdentifier,
    lastName: result.person.lastName,
    firstName: result.person.firstName,
    dateOfBirth: result.person.dateOfBirth,
    prisonName: res.locals.user.activeCaseLoad?.description,
    cellLocation: result.person.cellLocation,
  }
  return result
}

export const getAbsenceCategorisationsFullSet = async (
  externalMovementsService: ExternalMovementsService,
  res: Response,
) => {
  const prisonAbsenceCategorisations = await externalMovementsService.getAbsenceCategoriesInUse({ res })

  const types = (await externalMovementsService.getAllAbsenceTypes({ res })).items.filter(itm =>
    prisonAbsenceCategorisations.types.find(itmInUse => itmInUse.code === itm.code),
  )
  const subTypes = dedupRef(
    (
      await Promise.all(
        types
          .filter(itm => itm.nextDomain)
          .map(async itm => externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_TYPE', itm.code)),
      )
    ).flatMap(itm => itm.items),
  ).filter(itm => prisonAbsenceCategorisations.subTypes.find(itmInUse => itmInUse.code === itm.code))
  const reasonCategories = dedupRef(
    (
      await Promise.all(
        subTypes
          .filter(itm => itm.nextDomain)
          .map(async itm => externalMovementsService.getAbsenceCategories({ res }, 'ABSENCE_SUB_TYPE', itm.code)),
      )
    ).flatMap(itm => itm.items),
  ).filter(itm => prisonAbsenceCategorisations.reasonCategories.find(itmInUse => itmInUse.code === itm.code))
  const reasons = dedupRef(
    (
      await Promise.all(
        reasonCategories
          .filter(itm => itm.nextDomain)
          .map(async itm => {
            const result = await externalMovementsService.getAbsenceCategories(
              { res },
              'ABSENCE_REASON_CATEGORY',
              itm.code,
            )
            for (const reason of result.items) {
              reason.description = `${itm.description} - ${reason.description}`
            }
            return result
          }),
      )
    ).flatMap(itm => itm.items),
  ).filter(itm => prisonAbsenceCategorisations.reasons.find(itmInUse => itmInUse.code === itm.code))

  return { types, subTypes, reasonCategories, reasons }
}

const dedupRef = (list: components['schemas']['AbsenceCategorisation'][]) => {
  const result: components['schemas']['AbsenceCategorisation'][] = []
  for (const itm of list) {
    if (!result.find(i => i.code === itm.code)) {
      result.push(itm)
    }
  }
  return result
}
