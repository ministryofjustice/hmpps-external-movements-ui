import { Request, Response } from 'express'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'
import { ResQuerySchemaType } from './schema'

export class SearchPrisonerController {
  constructor(readonly prisonerSearchApiService: PrisonerSearchApiService) {}

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    res.render('search-prisoner/view', {
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      results: resQuery?.validated?.searchTerm
        ? (await this.prisonerSearchApiService.searchPrisoner({ res }, resQuery.validated.searchTerm)).content
        : [],
    })
  }
}
