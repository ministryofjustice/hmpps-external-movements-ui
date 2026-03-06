import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { Page } from '../../services/auditService'
import { CreateDocumentsController } from './controller'
import { validate } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const CreateDocumentsRoutes = ({
  externalMovementsService,
  documentGenerationService,
  prisonerSearchService,
}: Services) => {
  const { router, get, post } = BaseRouter()

  const temporaryAbsenceController = new CreateDocumentsController(
    externalMovementsService,
    documentGenerationService,
    prisonerSearchService,
    'TEMPORARY_ABSENCE',
  )

  get('/temporary-absence/:id', Page.CREATE_DOCUMENTS, temporaryAbsenceController.GET)
  post('/temporary-absence/:id', validate(schema), temporaryAbsenceController.POST)

  return router
}
