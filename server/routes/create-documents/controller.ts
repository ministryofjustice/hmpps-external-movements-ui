import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import DocumentGenerationService, { DOCUMENT_TYPE } from '../../services/apis/documentGenerationService'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'
import { SchemaType } from './schema'
import config from '../../config'

export class CreateDocumentsController {
  constructor(
    readonly externalMovementsService: ExternalMovementsService,
    readonly documentGenerationService: DocumentGenerationService,
    readonly prisonerSearchApiService: PrisonerSearchApiService,
    readonly documentType: DOCUMENT_TYPE,
  ) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    const [templates, entity] = await Promise.all([
      this.documentGenerationService
        .getTemplatesForGroup({ res }, this.documentType)
        .then(response => response.templates),
      this.fetchEntity(req, res, true),
    ])

    res.render('create-documents/view', {
      showBreadcrumbs: true,
      templates: templates.map(({ id: value, name: text }) => ({ value, text })),
      entity,
    })
  }

  POST = async (req: Request<{ id: string }, unknown, SchemaType>, res: Response) => {
    if (this.documentType === 'TEMPORARY_ABSENCE') {
      const entity = (await this.fetchEntity(req, res, false))!

      return res.redirect(
        `${config.serviceUrls.documentGeneration}/download-document/${req.body.template}?${new URLSearchParams({
          prisonId: entity.prison.code,
          prisonNumber: entity.person.personIdentifier,
          absenceId: entity.id,
          returnTo: config.ingressUrl + req.originalUrl,
        }).toString()}`,
      )
    }

    throw new Error(`Document generation not implemented yet for template group: ${this.documentType}`)
  }

  fetchEntity = async (req: Request<{ id: string }>, res: Response, populatePrisonerDetails: boolean) => {
    if (this.documentType === 'TEMPORARY_ABSENCE') {
      const entity = await this.externalMovementsService.getTapAuthorisation({ res }, req.params.id)
      if (populatePrisonerDetails) {
        res.locals.prisonerDetails = await this.prisonerSearchApiService.getPrisonerDetails(
          { res },
          entity.person.personIdentifier,
        )
      }
      return entity
    }

    return null
  }
}
