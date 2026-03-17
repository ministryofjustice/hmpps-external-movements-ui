import { Request, Response } from 'express'
import DocumentGenerationService from '../../../../services/apis/documentGenerationService'
import { SchemaType } from './schema'
import config from '../../../../config'

export class SelectDocumentTypeController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.createDocumentJourney!.returnUrl ??= req.originalUrl

    const { templates } = await this.documentGenerationService.getTemplatesForGroup(
      { res },
      req.journeyData.createDocumentJourney!.documentGroup,
    )

    // This controller shares the same view as /create-document/<id>
    res.render('create-documents/view', {
      showBreadcrumbs: true,
      templates: templates.map(({ id: value, name: text }) => ({ value, text })),
      template: req.journeyData.createDocumentJourney!.templateId,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const template = await this.documentGenerationService.getTemplateById({ res }, req.body.template)

    if (template.variables.domains.find(domain => domain.code === 'TEMPORARY_ABSENCE')) {
      req.journeyData.createDocumentJourney!.templateId = template.id
      return res.redirect('select-absence-plan')
    }

    return res.redirect(
      `${config.serviceUrls.documentGeneration}/download-document/${req.body.template}?${new URLSearchParams({
        prisonId: res.locals.user.getActiveCaseloadId()!,
        prisonNumber: req.journeyData.prisonerDetails!.prisonerNumber,
        returnTo: config.ingressUrl + req.journeyData.createDocumentJourney!.returnUrl!,
      }).toString()}`,
    )
  }
}
