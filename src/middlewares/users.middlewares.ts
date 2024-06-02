import { ParamSchema, checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '../constants/messages'
import User from '../models/User.model'
import bcrypt from 'bcrypt'
import { verifyToken } from '../utils/jwt'
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '../models/requests/User.requests'
import { ROLE_HIERARCHY } from '../constants/roles'
import usersService from '../services/users.services'
import userFormService from '../services/userforms.services'
import AuthorizationError from '../errors/AuthorizationError'
import RefreshToken from '../models/RefreshToken.model'
import combinePermissions from '../utils/combineRoles'
import { AccessRight } from '../constants/permission'
import { USER_STATUS_VALUES } from '../constants/status'
import { JsonWebTokenError } from 'jsonwebtoken'
import BadRequestError from '../errors/BadRequestError'
import NotFoundError from '../errors/NotFoundError'
import AuthenticationError from '../errors/AuthenticationError'
import { requestHandlerWrapper } from '../utils/handler'
import { validate } from './common.middlewares'
import { envConfig } from '../config/env'

/**
 * @swagger
 * components:
 *  schemas:
 *    PasswordSchema:
 *      type: string
 *      description: "A valid password string that is not empty, has a length between 6 and 50 characters, and is strong (includes at least one lowercase letter, one uppercase letter, one number, and one symbol)."
 *      example: "Password123!"
 *      minLength: 6
 *      maxLength: 50
 */
const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    NameSchema:
 *      type: string
 *      description: "A valid name string that is not empty, is trimmed, and has a length between 1 and 100 characters."
 *      example: "John Doe"
 *      minLength: 1
 *      maxLength: 100
 */
const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_30
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    ImageSchema:
 *      type: string
 *      description: "A valid image URL string that is optional, is trimmed, and has a length between 1 and 2048 characters."
 *      example: "https://example.com/image.jpg"
 *      format: uri
 *      minLength: 1
 *      maxLength: 2048
 */
const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_MUST_BE_A_STRING
  },
  trim: true,
  isURL: {
    errorMessage: USERS_MESSAGES.IMAGE_MUST_BE_A_URL
  },
  isLength: {
    options: {
      min: 1,
      max: 2048
    },
    errorMessage: USERS_MESSAGES.IMAGE_LENGTH_MUST_BE_FROM_1_TO_2048
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const password = req.body.password
            const user = await usersService.getUserByEmail(value)
            // console.log(user)
            if (!user) {
              throw new BadRequestError({
                message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
                context: { api: 'loginMiddleware' }
              })
            }

            if (user.isDeleted) {
              throw new AuthenticationError({
                message: USERS_MESSAGES.YOUR_ACCOUNT_IS_DELETED,
                context: { api: 'loginMiddleware' }
              })
            }

            // nếu user tồn tại thì có password chắc
            const hashsedPass = user.password as string
            const result = await bcrypt.compare(password, hashsedPass)
            if (!result) {
              throw new AuthenticationError({
                message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
                context: { api: 'loginMiddleware' }
              })
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      last_name: { ...nameSchema, optional: true },
      first_name: { ...nameSchema, optional: true },
      address: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.ADDRESS_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 500
          },
          errorMessage: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_FROM_1_TO_500
        }
      },
      insurance_number: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.INSURANCE_NUMBER_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 30
          },
          errorMessage: USERS_MESSAGES.INSURANCE_NUMBER_LENGTH_MUST_BE_FROM_1_TO_30
        }
      },
      citizen_id: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.CITIZEN_ID_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 20
          },
          errorMessage: USERS_MESSAGES.CITIZEN_ID_LENGTH_MUST_BE_FROM_1_TO_20
        }
      },
      phone: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.PHONE_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 15
          },
          errorMessage: USERS_MESSAGES.PHONE_LENGTH_MUST_BE_FROM_1_TO_15
        }
      },
      avatar: imageSchema,
      employee_id: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.EMPLOYEE_ID_MUST_BE_A_STRING
        },
        isInt: {
          errorMessage: USERS_MESSAGES.EMPLOYEE_ID_MUST_BE_STRING_UNIQUE,
          options: { allow_leading_zeroes: true }
        },
        isLength: {
          options: {
            min: 4,
            max: 8
          },
          errorMessage: USERS_MESSAGES.EMPLOYEE_ID_LENGTH_MUST_BE_FROM_4_TO_8
        },
        trim: true
      }
    },
    ['body']
  )
)

// có thể là authorization hoặc Authorization
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            // console.log(access_token)
            if (!access_token) {
              throw new AuthorizationError({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                context: { api: 'accessTokenMiddleware' }
              })
            }
            const decodedAuthorization = await verifyToken({
              token: access_token,
              secretOrPublicKey: envConfig.jwtSecretAccessToken as string
            })
            // console.log(decodedAuthorization)

            if (!decodedAuthorization) {
              throw new AuthorizationError({
                message: USERS_MESSAGES.INVALID_ACCESS_TOKEN,
                context: { api: 'accessTokenMiddleware' }
              })
            }
            req.decoded_authorization = decodedAuthorization
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new AuthorizationError({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                context: { api: 'refreshTokenMiddleware' }
              })
            }
            try {
              const [decodedRefreshToken, refreshTokenDB] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: envConfig.jwtSecretRefreshToken as string
                }),
                RefreshToken.findOne({ where: { token: value } })
              ])

              if (!refreshTokenDB) {
                throw new NotFoundError({
                  message: USERS_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                  context: { api: 'refreshTokenMiddleware' }
                })
              }
              // Nếu tk bị delete thì không cấp lại
              const { user_id: userId } = decodedRefreshToken as TokenPayload
              const { isDeleted } = (await usersService.getUser(userId)) as User

              if (isDeleted) {
                throw new AuthenticationError({
                  message: USERS_MESSAGES.YOUR_ACCOUNT_IS_DELETED,
                  context: { api: 'refreshTokenMiddleware' }
                })
              }
              req.decoded_refresh_token = decodedRefreshToken
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new AuthorizationError({
                  message: USERS_MESSAGES.INVALID_REFRESH_TOKEN,
                  context: { api: 'refreshTokenMiddleware' }
                })
              }

              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const isDirectManagerMiddleware = (idType: 'userId' | 'userFormId') => {
  return requestHandlerWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { roles } = req.decoded_authorization as TokenPayload

    if (roles.includes('Admin')) return next()

    let services = null
    let id = null
    switch (idType) {
      case 'userId':
        services = usersService
        id = req.params.userId
        break
      case 'userFormId':
        services = userFormService
        id = req.params.userFormId
        break
    }

    const { user_id: managerId } = req.decoded_authorization as TokenPayload
    const result = await services.getManager(id)
    if (!result || result.id !== managerId) {
      next(
        new AuthorizationError({
          message: 'You do not have permission to access this resource',
          context: {
            api: 'isDirectManagerMiddleware'
          }
        })
      )
    }
    return next()
  })
}

export const haveAccessMiddleware = requestHandlerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.decoded_authorization)
  const { roles } = req.decoded_authorization as TokenPayload
  if (roles.includes('Admin')) {
    return next()
  }

  let accessRight: AccessRight = req.method as AccessRight
  switch (req.method) {
    case 'GET':
      accessRight = 'isCanRead'
      break
    case 'PATCH':
      accessRight = 'isCanEdit'
      break
    case 'POST':
      accessRight = 'isCanAdd'
      break
    case 'DELETE':
      accessRight = 'isCanDelete'
      break
  }

  const permissions = await usersService.getPermissionsByRoles(roles)
  const routePath = req.baseUrl + (req.route.path === '/' ? '' : req.route.path)
  const combinedPermissions = combinePermissions(permissions)
  const permission = combinedPermissions.find((permission) => permission.api === routePath)

  if (!permission || !permission[accessRight]) {
    return next(
      new AuthorizationError({
        message: 'You do not have permission to access this resource',
        context: {
          api: 'haveAccessMiddleware'
        }
      })
    )
  }
  next()
})

export const changePasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      oldPassword: passwordSchema,
      confirmPassword: {
        ...passwordSchema,
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new BadRequestError({
                message: 'Passwords do not match',
                context: { api: 'changePasswordMiddleware' }
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

export const checkStatusValidator = validate(
  checkSchema(
    {
      status: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [USER_STATUS_VALUES],
          errorMessage: `Status must be one of the following values: ${USER_STATUS_VALUES.join(', ')}`
        }
      }
    },
    ['body']
  )
)

export const userIdValidator = validate(
  checkSchema(
    {
      userId: {
        in: ['params'],
        isUUID: {
          errorMessage: USERS_MESSAGES.USER_ID_MUST_BE_A_VALID_UUID
        },
        custom: {
          options: async (value) => {
            const user = await usersService.getUser(value)

            if (!user) {
              throw new NotFoundError({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                context: {
                  api: 'userIdValidator'
                }
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const accessUserMiddleware = requestHandlerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // check if roles > Manager
  const { user_id: requestedUserId, roles } = req.decoded_authorization as TokenPayload

  const highestRole = Math.max(...roles.map((role) => ROLE_HIERARCHY[role]))
  if (highestRole > ROLE_HIERARCHY['Manager']) {
    return next()
  }

  // check if the owner of the resource
  if (requestedUserId === req.params.userId) return next()

  // check if the user is the direct manager of the owner of the resource
  if (roles.includes('Manager')) {
    const managerInfo = await usersService.getManager(req.params.userId)
    if (managerInfo && managerInfo.id === requestedUserId) {
      return next()
    }
  }

  // Not allowed
  next(
    new AuthorizationError({
      message: 'You do not have permission to access this resource',
      context: {
        api: 'accessUserMiddleware'
      }
    })
  )
})

export const meAccessMiddleware = requestHandlerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { user_id: userId } = req.decoded_authorization as TokenPayload
  const user = await usersService.getUser(userId)
  if (user?.isDeleted) {
    return next(
      new BadRequestError({
        message: 'User is deleted',
        context: {
          api: 'meAccessMiddleware'
        }
      })
    )
  }

  return next()
})
