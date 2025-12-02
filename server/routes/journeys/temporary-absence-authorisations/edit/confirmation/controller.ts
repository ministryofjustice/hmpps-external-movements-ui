import { Request, Response } from 'express'

const PROP_NAMES: { [key: string]: string } = {
  fromDate: 'start date',
  toDate: 'end date',
}

export class EditTapAuthorisationConfirmationController {
  GET = async (req: Request, res: Response) => {
    const updatedProps = req.journeyData
      .updateTapAuthorisation!.result!.content[0]!.changes.map(
        ({ propertyName }) => PROP_NAMES[propertyName] ?? propertyName,
      )
      .join(' and ')

    res.render('temporary-absence-authorisations/edit/confirmation/view', {
      updatedProps,
      domainEvent: req.journeyData.updateTapAuthorisation!.result!.content[0]!.domainEvents[0],
      authorisation: req.journeyData.updateTapAuthorisation!.authorisation,
    })
  }
}
