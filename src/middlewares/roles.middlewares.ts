import { checkSchema } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import roleService from '../services/roles.services'
import _ from 'lodash'
import BadRequestError from '../errors/BadRequestError'
import { requestHandlerWrapper } from '../utils/handler'
import { ROLES } from '../constants/roles'
import { RoleOrderByArray } from '../constants/order'
import { validate } from './common.middlewares'
import NotFoundError from '../errors/NotFoundError'

export const assignRoleValidator = validate(
  checkSchema(
    {
      assignments: {
        isArray: {
          options: { min: 1 },
          errorMessage: 'Assignments should be an array with at least one element'
        }
      },
      'assignments.*.userId': {
        isUUID: {
          errorMessage: 'UserId must be a valid UUID'
        }
      },
      'assignments.*.roles': {
        isArray: {
          errorMessage: 'Roles must be an array'
        }
      },
      'assignments.*.roles.*': {
        isUUID: {
          errorMessage: 'Each role must be a valid UUID'
        }
      }
    },
    ['body']
  )
)

export const roleModulesMustNotExistedMiddleware = requestHandlerWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params
    const roleModulesArr = req.body as {
      api: string
      isCanRead: boolean
      isCanAdd: boolean
      isCanEdit: boolean
      isCanDelete: boolean
      isCanApprove: boolean
    }[]
    const roleModuleApiArr = roleModulesArr.map((roleModule) => roleModule.api)

    const permissions = await roleService.getRoleModulesByRoleId(roleId, ['api'])

    const result = _.intersectionWith(roleModuleApiArr, permissions, (apiStr, apiObj) => apiStr === apiObj.api)

    if (result.length === 0) {
      return next()
    }

    throw new BadRequestError({
      message: 'One or more role modules already existed for the role. See details in context.',
      context: { api: 'isRoleModulesExistedMiddleware', result }
    })
  }
)

export const roleModulesMustExistedMiddleware = requestHandlerWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params
    const roleModulesArr = req.body as {
      api: string
      isCanRead: boolean
      isCanAdd: boolean
      isCanEdit: boolean
      isCanDelete: boolean
      isCanApprove: boolean
    }[]
    const roleModuleApiArr = roleModulesArr.map((roleModule) => roleModule.api)

    const permissions = await roleService.getRoleModulesByRoleId(roleId, ['api'])

    const result = _.differenceWith(roleModuleApiArr, permissions, (apiStr, apiObj) => apiStr === apiObj.api)

    if (result.length === 0) {
      return next()
    }

    throw new BadRequestError({
      message: 'One or more role modules are not existed in the role. See details in context.',
      context: { api: 'isRoleModulesExistedMiddleware', result }
    })
  }
)

export const roleIdValidator = validate(
  checkSchema(
    {
      roleId: {
        isUUID: {
          errorMessage: 'RoleId must be a valid UUID'
        },
        custom: {
          options: async (roleId) => {
            const role = await roleService.getRole(roleId)

            if (!role)
              throw new NotFoundError({
                message: 'Role not found',
                context: { api: 'roleIdValidator' }
              })

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const roleModulesValidator = validate(
  checkSchema({
    '*.api': {
      in: ['body'],
      errorMessage: 'api is required',
      isString: {
        errorMessage: 'api should be a string'
      },
      exists: {
        errorMessage: 'api is required'
      }
    },
    '*.isCanRead': {
      in: ['body'],
      errorMessage: 'isCanRead is required',
      isBoolean: {
        errorMessage: 'isCanRead should be a boolean'
      },
      exists: {
        errorMessage: 'isCanRead is required'
      }
    },
    '*.isCanAdd': {
      in: ['body'],
      errorMessage: 'isCanAdd is required',
      isBoolean: {
        errorMessage: 'isCanAdd should be a boolean'
      },
      exists: {
        errorMessage: 'isCanAdd is required'
      }
    },
    '*.isCanEdit': {
      in: ['body'],
      errorMessage: 'isCanEdit is required',
      isBoolean: {
        errorMessage: 'isCanEdit should be a boolean'
      },
      exists: {
        errorMessage: 'isCanEdit is required'
      }
    },
    '*.isCanDelete': {
      in: ['body'],
      errorMessage: 'isCanDelete is required',
      isBoolean: {
        errorMessage: 'isCanDelete should be a boolean'
      },
      exists: {
        errorMessage: 'isCanDelete is required'
      }
    },
    '*.isCanApprove': {
      in: ['body'],
      errorMessage: 'isCanApprove is required',
      isBoolean: {
        errorMessage: 'isCanApprove should be a boolean'
      },
      exists: {
        errorMessage: 'isCanApprove is required'
      }
    }
  })
)

export const getUsersValidator = validate(
  checkSchema({
    roleName: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [ROLES],
        errorMessage: `roleName should be in ${ROLES.join(', ')}`
      }
    },
    orderBy: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [RoleOrderByArray],
        errorMessage: `orderBy should be in ${RoleOrderByArray.join(', ')}`
      }
    },
    order: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [['ASC', 'DESC']],
        errorMessage: 'order should be in ASC, DESC'
      }
    },
    isCanRead: {
      in: ['query'],
      optional: true,
      isBoolean: {
        errorMessage: 'isCanRead should be a boolean'
      }
    },
    isCanAdd: {
      in: ['query'],
      optional: true,
      isBoolean: {
        errorMessage: 'isCanAdd should be a boolean'
      }
    },
    isCanEdit: {
      in: ['query'],
      optional: true,
      isBoolean: {
        errorMessage: 'isCanEdit should be a boolean'
      }
    },
    isCanDelete: {
      in: ['query'],
      optional: true,
      isBoolean: {
        errorMessage: 'isCanDelete should be a boolean'
      }
    }
  })
)
