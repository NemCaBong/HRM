import { Router } from 'express'
import { deleteRoleModuleController, undeleteRoleModuleController } from '../controllers/rolemodules.controllers'
import { requestHandlerWrapper } from '../utils/handler'
import { roleModuleIdValidator } from '../middlewares/rolemodules.middlewares'
import { accessTokenValidator, haveAccessMiddleware } from '../middlewares/users.middlewares'

const roleModulesRouter = Router()

roleModulesRouter.delete(
  '/:roleModuleId/delete',
  accessTokenValidator,
  haveAccessMiddleware,
  roleModuleIdValidator,
  requestHandlerWrapper(deleteRoleModuleController)
)

roleModulesRouter.patch(
  '/:roleModuleId/undelete',
  accessTokenValidator,
  haveAccessMiddleware,
  roleModuleIdValidator,
  requestHandlerWrapper(undeleteRoleModuleController)
)

export default roleModulesRouter
