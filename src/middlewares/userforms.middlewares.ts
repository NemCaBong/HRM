import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { UserFormStatus } from '../constants/enums'
import { USER_FORMS_MESSAGES } from '../constants/messages'
import { UserFormOrderByArray } from '../constants/order'
import { uuidFormat } from '../constants/regex'
import { ROLE_HIERARCHY } from '../constants/roles'
import AuthorizationError from '../errors/AuthorizationError'
import BadRequestError from '../errors/BadRequestError'
import { TokenPayload } from '../models/requests/User.requests'
import userFormService from '../services/userforms.services'
import { requestHandlerWrapper } from '../utils/handler'
import NotFoundError from '../errors/NotFoundError'
import UserForm from '../models/UserForm.model'
import { validate } from './common.middlewares'

export const submitUserFormDetailValidator = validate(
  checkSchema(
    {
      '*': {
        custom: {
          options: (value, { path: key, req }) => {
            // Check if the key is a UUID
            if (!uuidFormat.test(key)) {
              throw new BadRequestError({
                message: USER_FORMS_MESSAGES.FORM_DETAILS_ID_MUST_BE_UUID,
                context: { api: 'submitUserFormDetailValidation' }
              })
            }

            // Check if the value is a string
            if (typeof value !== 'string' || value.length < 2 || value.length > 1000) {
              throw new BadRequestError({
                message: USER_FORMS_MESSAGES.CONTENT_MUST_BE_STRING_WITH_LENGTH_FROM_2_TO_1000,
                context: { api: 'submitUserFormDetailValidation' }
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getUserFormsValidator = validate(
  checkSchema(
    {
      limit: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: USER_FORMS_MESSAGES.LIMIT_MUST_BE_INTEGER_BETWEEN_1_AND_100
        }
      },
      page: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: USER_FORMS_MESSAGES.PAGE_MUST_BE_INTEGER_GREATER_THAN_0
        }
      },
      status: {
        in: ['query'],
        optional: true,
        isString: {
          errorMessage: USER_FORMS_MESSAGES.STATUS_MUST_BE_STRING
        },
        custom: {
          options: (value) => {
            if (!Object.values(UserFormStatus).includes(value)) {
              throw new BadRequestError({
                message: USER_FORMS_MESSAGES.INVALID_STATUS,
                context: { api: 'getUserFormsValidation' }
              })
            }

            return true
          }
        }
      },
      order: {
        in: ['query'],
        optional: true,
        isString: {
          errorMessage: USER_FORMS_MESSAGES.ORDER_MUST_BE_STRING
        },
        custom: {
          options: (value) => {
            if (!['ASC', 'DESC'].includes(value)) {
              throw new BadRequestError({
                message: USER_FORMS_MESSAGES.INVALID_ORDER,
                context: { api: 'getUserFormsValidation' }
              })
            }

            return true
          }
        }
      },
      orderBy: {
        in: ['query'],
        optional: true,
        isString: {
          errorMessage: USER_FORMS_MESSAGES.ORDER_BY_MUST_BE_STRING
        },
        custom: {
          options: (value) => {
            if (!UserFormOrderByArray.includes(value)) {
              throw new BadRequestError({
                message: USER_FORMS_MESSAGES.INVALID_ORDERBY,
                context: { api: 'getUserFormsValidation' }
              })
            }

            return true
          }
        }
      }
    },
    ['query']
  )
)

export const userFormIdValidator = validate(
  checkSchema(
    {
      userFormId: {
        in: ['params'],
        isUUID: {
          errorMessage: USER_FORMS_MESSAGES.USER_FORM_MUST_BE_UUID
        },
        custom: {
          options: async (value, { req }) => {
            const result = await userFormService.getOneUserForm(value)
            const { roles } = req.decoded_authorization as TokenPayload
            const highestRole = Math.max(...roles.map((role) => ROLE_HIERARCHY[role]))

            if (!result) {
              throw new NotFoundError({
                message: USER_FORMS_MESSAGES.USER_FORM_NOT_FOUND,
                context: { userFormId: value, api: 'userFormIdValidator' }
              })
            }

            if (result.isDeleted === true && highestRole < ROLE_HIERARCHY['HR']) {
              throw new NotFoundError({
                message: USER_FORMS_MESSAGES.USER_FORM_HAS_BEEN_DELETED,
                context: { userFormId: value, api: 'userFormIdValidator' }
              })
            }
            req.userForm = result
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const isOwnerUserFormMiddleware = requestHandlerWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.userForm as UserForm
    const { user_id, roles } = req.decoded_authorization as TokenPayload

    if (roles.includes('Admin')) {
      return next()
    }

    if (userId !== user_id) {
      next(
        new AuthorizationError({
          message: USER_FORMS_MESSAGES.NOT_USER_FORM_TO_PERFORM_ACTION,
          context: {
            userFormId: req.params.userFormId,
            api: 'isOwnerUserFormMiddleware'
          }
        })
      )
    }
    return next()
  }
)

export const isPendingApprovalMiddleware = requestHandlerWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userFormService.ifUserFormPendingApproval(req.params.userFormId)

    if (!result) {
      next(
        new BadRequestError({
          message: USER_FORMS_MESSAGES.USER_FORM_NOT_PENDING_APPROVAL,
          context: {
            userFormId: req.params.userFormId,
            api: 'isPendingApprovalMiddleware'
          },
          logging: false
        })
      )
    }
    return next()
  }
)

export const isApprovedMiddleware = requestHandlerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const result = await userFormService.ifUserFormApproved(req.params.userFormId)

  if (!result) {
    next(
      new BadRequestError({
        message: USER_FORMS_MESSAGES.USER_FORM_NOT_APPROVED,
        context: {
          userFormId: req.params.userFormId,
          api: 'isApprovedMiddleware'
        },
        logging: false
      })
    )
  }
  return next()
})

export const accessUserFormMiddleware = requestHandlerWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // check if roles > Manager
    const { user_id: requestedUserId, roles } = req.decoded_authorization as TokenPayload
    const highestRole = Math.max(...roles.map((role) => ROLE_HIERARCHY[role]))

    if (highestRole > ROLE_HIERARCHY['Manager']) {
      return next()
    }

    // check if the owner of the resource
    const result = await userFormService.isOwner(req.params.userFormId, requestedUserId)
    // console.log(result)
    if (result) {
      return next()
    }

    // check if the user is the direct manager of the owner of the resource
    if (roles.includes('Manager')) {
      const result = await userFormService.getManager(req.params.userFormId)
      // console.log(result, requestedUserId)
      if (result && result.id === requestedUserId) {
        return next()
      }
    }

    // Not allowed
    next(
      new AuthorizationError({
        message: USER_FORMS_MESSAGES.DONT_HAVE_ACCESS_TO_USER_FORM,
        context: {
          api: 'accessUserFormMiddleware'
        }
      })
    )
  }
)

export const assignUserFormValidator = validate(
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
    '*.formIds': {
      in: ['body'],
      errorMessage: 'formIds is required',
      isArray: {
        errorMessage: 'formIds should be an array'
      },
      exists: {
        errorMessage: 'formIds is required'
      }
    },
    '*.formIds.*': {
      in: ['body'],
      errorMessage: 'formId is required',
      isUUID: {
        errorMessage: 'Each formId should be a valid UUID'
      }
    }
  })
)

export const cannotUpdateUserFormIfDeletedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { isDeleted } = req.userForm as UserForm
  const routePath = req.baseUrl + (req.route.path === '/' ? '' : req.route.path)

  if (isDeleted && routePath === '/user-forms/:userFormId' && req.method === 'PATCH') {
    return res.status(400).json({ message: USER_FORMS_MESSAGES.USER_FORM_IS_DELETED, result: null })
  }

  next()
}
