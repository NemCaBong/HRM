import { Router } from 'express'
import {
  addNewRoleModulesController,
  getRoleController,
  getRolesController,
  updateRoleModulesController
} from '../controllers/roles.controllers'
import {
  assignRoleValidator,
  getUsersValidator,
  roleIdValidator,
  roleModulesMustExistedMiddleware,
  roleModulesMustNotExistedMiddleware,
  roleModulesValidator
} from '../middlewares/roles.middlewares'
import { accessTokenValidator, haveAccessMiddleware } from '../middlewares/users.middlewares'
import { requestHandlerWrapper } from '../utils/handler'

const rolesRouter = Router()

rolesRouter.get(
  '/',
  accessTokenValidator,
  haveAccessMiddleware,
  getUsersValidator,
  requestHandlerWrapper(getRolesController)
)

rolesRouter.get(
  '/:roleId',
  accessTokenValidator,
  haveAccessMiddleware,
  roleIdValidator,
  requestHandlerWrapper(getRoleController)
)

rolesRouter.post(
  '/:roleId/role-modules',
  accessTokenValidator,
  haveAccessMiddleware,
  roleIdValidator,
  roleModulesValidator,
  roleModulesMustNotExistedMiddleware,
  requestHandlerWrapper(requestHandlerWrapper(addNewRoleModulesController))
)

rolesRouter.patch(
  '/:roleId/role-modules',
  accessTokenValidator,
  haveAccessMiddleware,
  roleIdValidator,
  roleModulesValidator,
  roleModulesMustExistedMiddleware,
  requestHandlerWrapper(updateRoleModulesController)
)

export default rolesRouter
