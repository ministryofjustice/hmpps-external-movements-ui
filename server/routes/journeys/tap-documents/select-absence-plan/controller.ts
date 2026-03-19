import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import config from '../../../../config'
import { setPaginationLocals } from '../../../../views/partials/simplePagination/utils'
import { getApiUserErrorMessage } from '../../../../utils/utils'
import { components } from '../../../../@types/externalMovements'

export class SelectAbsencePlanController {
  constructor(private readonly externalMovementsService: ExternalMovementsService) {}

  private PAGE_SIZE = 25

  GET = async (req: Request<unknown, unknown, unknown, { page?: string }>, res: Response) => {
    const page = req.query.page?.match(/^\d+$/) ? Number(req.query.page) : 1
    let results: components['schemas']['TapAuthorisationResult'][] = []

    try {
      const searchResponse = await this.externalMovementsService.searchTapAuthorisations(
        { res },
        {
          query: req.journeyData.prisonerDetails!.prisonerNumber,
          prisonCode: res.locals.user.getActiveCaseloadId()!,
          status: [],
          sort: 'start,desc',
          page,
          size: this.PAGE_SIZE,
        },
      )

      results = searchResponse.content

      setPaginationLocals(
        res,
        this.PAGE_SIZE,
        page,
        searchResponse?.metadata?.totalElements ?? 0,
        searchResponse.content.length,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('tap-documents/select-absence-plan/view', {
      backUrl: req.journeyData.createDocumentJourney!.selectTypeUrl,
      results,
      documentGenerationUrl: `${config.serviceUrls.documentGeneration}/download-document/${req.journeyData.createDocumentJourney!.templateId}?${new URLSearchParams(
        {
          prisonId: res.locals.user.getActiveCaseloadId()!,
          prisonNumber: req.journeyData.prisonerDetails!.prisonerNumber,
          returnTo: config.ingressUrl + req.journeyData.createDocumentJourney!.tapHomepageUrl,
        },
      ).toString()}`,
    })
  }
}
