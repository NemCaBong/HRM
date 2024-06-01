import NotFoundError from '../errors/NotFoundError'
import { validate } from './common.middlewares'
import { checkSchema } from 'express-validator'
import roleModuleService from '../services/rolemodules.services'

export const roleModuleIdValidator = validate(
  checkSchema(
    {
      roleModuleId: {
        isUUID: {
          errorMessage: 'Role module Id must be a valid UUID'
        },
        custom: {
          options: async (roleModuleId) => {
            const role = await roleModuleService.getRoleModule(roleModuleId)

            if (!role)
              throw new NotFoundError({
                message: 'Role not found',
                context: { api: 'roleIdValidator', roleModuleId }
              })

            return true
          }
        }
      }
    },
    ['params']
  )
)
