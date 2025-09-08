import { Request, Response } from 'express'
import PrisonerSearchApiService from '../../services/prisonerSearch/prisonerSearchService'

export class SearchPrisonerController {
  constructor(readonly prisonerSearchApiService: PrisonerSearchApiService) {}

  GET = async (req: Request<unknown, unknown, unknown, { searchTerm?: string }>, res: Response) => {
    res.render('search-prisoner/view', {
      showBreadcrumbs: true,
      searchTerm: req.query.searchTerm,
      results: req.query.searchTerm
        ? (await this.prisonerSearchApiService.searchPrisoner({ res }, req.query.searchTerm)).content
        : [],
    })
  }
}
