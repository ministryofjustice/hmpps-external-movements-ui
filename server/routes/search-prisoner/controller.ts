import { Request, Response } from 'express'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'
import { ResQuerySchemaType } from './schema'
import { prisonerProfileBacklink } from '../../utils/utils'
import Prisoner from '../../services/apis/model/prisoner'

export class SearchPrisonerController {
  constructor(
    readonly prisonerSearchApiService: PrisonerSearchApiService,
    readonly config: {
      caption: string
      action: { label: string; url: string }
    },
  ) {}

  GET = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    let searchResponse: Prisoner[] = []

    if (resQuery?.validated?.searchTerm) {
      searchResponse = await this.prisonerSearchApiService.searchPrisoner({ res }, resQuery.validated.searchTerm)
    }

    res.render('search-prisoner/view', {
      caption: this.config.caption,
      action: this.config.action,
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      results: searchResponse.length
        ? searchResponse.map(prisoner => ({
            ...prisoner,
            backLink: prisonerProfileBacklink(req.originalUrl, prisoner.prisonerNumber),
          }))
        : [],
    })
  }
}
