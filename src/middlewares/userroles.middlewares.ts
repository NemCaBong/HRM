import { checkSchema } from 'express-validator'
import userRoleService from '../services/userroles.services'
import BadRequestError from '../errors/BadRequestError'
import { validate } from './common.middlewares'

export const addUserRolesValidator = validate(
  checkSchema({
    '*.userId': {
      in: ['body'],
      errorMessage: 'userId is required',
      isUUID: {
        errorMessage: 'userId should be a valid UUID'
      },
      exists: {
        errorMessage: 'userId is required'
      }
    },
    '*.roleIds': {
      in: ['body'],
      errorMessage: 'roleIds is required',
      isArray: {
        errorMessage: 'roleIds should be an array'
      },
      exists: {
        errorMessage: 'roleIds is required'
      }
    },
    '*.roleIds.*': {
      in: ['body'],
      errorMessage: 'roleId is required',
      isUUID: {
        errorMessage: 'Each roleId should be a valid UUID'
      }
    }
  })
)

export const userRoleIdValidator = validate(
  checkSchema({
    userRoleId: {
      in: ['params'],
      errorMessage: 'userRoleId is required',
      isUUID: {
        errorMessage: 'userRoleId should be a valid UUID'
      },
      exists: {
        errorMessage: 'userRoleId is required'
      },
      custom: {
        options: async (value) => {
          const userRole = await userRoleService.getUserRoleById(value)
          if (!userRole) {
            throw new BadRequestError({
              message: 'User role not found',
              context: { userRoleId: value, api: 'userRoleIdValidator' }
            })
          }

          return true
        }
      }
    }
  })
)
