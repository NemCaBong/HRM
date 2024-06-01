import { Router } from 'express'
import {
  createMultipleUserRoleController,
  deleteUserRoleController,
  undeleteUserRoleController
} from '../controllers/userroles.controllers'
import { accessTokenValidator, haveAccessMiddleware } from '../middlewares/users.middlewares'
import { requestHandlerWrapper } from '../utils/handler'
import { addUserRolesValidator, userRoleIdValidator } from '../middlewares/userroles.middlewares'

const userRolesRouter = Router()

userRolesRouter.post(
  '/',
  accessTokenValidator,
  haveAccessMiddleware,
  addUserRolesValidator,
  addUserRolesValidator,
  requestHandlerWrapper(createMultipleUserRoleController)
)

userRolesRouter.delete(
  '/:userRoleId/delete',
  accessTokenValidator,
  haveAccessMiddleware,
  userRoleIdValidator,
  requestHandlerWrapper(deleteUserRoleController)
)

userRolesRouter.patch(
  '/:userRoleId/undelete',
  accessTokenValidator,
  haveAccessMiddleware,
  userRoleIdValidator,
  requestHandlerWrapper(undeleteUserRoleController)
)

export default userRolesRouter
