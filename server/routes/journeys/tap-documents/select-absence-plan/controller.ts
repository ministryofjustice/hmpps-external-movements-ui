import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import config from '../../../../config'

export class SelectAbsencePlanController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request, res: Response) => {
    res.render('tap-documents/select-absence-plan/view', {
      backUrl: req.journeyData.createDocumentJourney!.returnUrl,
      results: (
        await this.externalMovementsService.searchTapAuthorisations(
          { res },
          {
            query: req.journeyData.prisonerDetails!.prisonerNumber,
            prisonCode: res.locals.user.getActiveCaseloadId()!,
            status: [],
            sort: 'start,desc',
            page: 1,
            size: 2000,
          },
        )
      ).content,
      documentGenerationUrl: `${config.serviceUrls.documentGeneration}/download-document/${req.journeyData.createDocumentJourney!.templateId}?${new URLSearchParams(
        {
          prisonId: res.locals.user.getActiveCaseloadId()!,
          prisonNumber: req.journeyData.prisonerDetails!.prisonerNumber,
          returnTo: config.ingressUrl + req.journeyData.createDocumentJourney!.returnUrl!,
        },
      ).toString()}`,
    })
  }
}
