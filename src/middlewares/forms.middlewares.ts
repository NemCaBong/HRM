import { ParamSchema, checkSchema } from 'express-validator'
import { FORMS_MESSAGES } from '../constants/messages'
import { FormOrderByArray } from '../constants/order'
import { uuidFormat } from '../constants/regex'
import BadRequestError from '../errors/BadRequestError'
import formService from '../services/forms.services'
import NotFoundError from '../errors/NotFoundError'
import { validate } from './common.middlewares'
import { Request, Response, NextFunction } from 'express'
import Form from '../models/Form.model'

/**
 * @swagger
 * components:
 *  schemas:
 *    FormNameSchema:
 *      type: string
 *      description: "A valid form name string that is not empty, is trimmed, and has a length between 1 and 300 characters."
 *      example: "Form Name"
 *      minLength: 1
 *      maxLength: 300
 */
const formNameSchema: ParamSchema = {
  isString: {
    errorMessage: FORMS_MESSAGES.NAME_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 300
    },
    errorMessage: FORMS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_300
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    DescriptionSchema:
 *      type: string
 *      description: "A valid description string that is not empty, is trimmed, and has a length between 1 and 500 characters."
 *      example: "This is a description"
 *      minLength: 1
 *      maxLength: 500
 */
const descriptionSchema: ParamSchema = {
  isString: {
    errorMessage: FORMS_MESSAGES.DESCRIPTION_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 500
    },
    errorMessage: FORMS_MESSAGES.DESCRIPTION_LENGTH_MUST_BE_FROM_1_TO_500
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    TotalSchema:
 *      type: integer
 *      description: "A valid total that is an integer and is not empty."
 *      example: 10
 */
const totalSchema: ParamSchema = {
  isInt: {
    errorMessage: FORMS_MESSAGES.TOTAL_MUST_BE_INTEGER
  },
  toInt: true,
  notEmpty: {
    errorMessage: FORMS_MESSAGES.TOTAL_MUST_NOT_BE_EMPTY
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    FormDetailsSchema:
 *      type: array
 *      description: "A valid form details array that is not empty."
 *      items: {}
 */
const formDetailsSchema: ParamSchema = {
  isArray: {
    errorMessage: FORMS_MESSAGES.FORM_DETAILS_MUST_BE_ARRAY
  },
  notEmpty: {
    errorMessage: FORMS_MESSAGES.FORM_DETAILS_MUST_NOT_BE_EMPTY
  }
}

export const formDetailValidator = validate(
  checkSchema(
    {
      name: formNameSchema,
      description: descriptionSchema,
      total: totalSchema,
      form_details: formDetailsSchema,
      'form_details.*': {
        custom: {
          options: (formDetail) => {
            if (!uuidFormat.test(formDetail.id)) {
              throw new BadRequestError({ message: 'ID must be a UUID', context: { api: 'formDetailValidation' } })
            }

            if (
              typeof formDetail.content !== 'string' ||
              formDetail.content.length < 2 ||
              formDetail.content.length > 1000
            ) {
              throw new BadRequestError({
                message: FORMS_MESSAGES.CONTENT_MUST_BE_STRING_WITH_LENGTH_FROM_2_TO_1000,
                context: { api: 'formDetailValidation' }
              })
            }

            if (typeof formDetail.index !== 'number') {
              throw new BadRequestError({
                message: FORMS_MESSAGES.FORM_DETAILS_INDEX_MUST_BE_NUMBER,
                context: { api: 'formDetailValidation' }
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

export const createNewFormValidator = validate(
  checkSchema(
    {
      name: formNameSchema,
      description: descriptionSchema,
      total: totalSchema,
      form_details: formDetailsSchema,
      'form_details.*': {
        custom: {
          options: (formDetail) => {
            if (!uuidFormat.test(formDetail.id)) {
              throw new BadRequestError({
                message: FORMS_MESSAGES.FORM_DETAILS_ID_MUST_BE_UUID,
                context: { api: 'createNewFormValidation' }
              })
            }

            if (
              typeof formDetail.content !== 'string' ||
              formDetail.content.length < 2 ||
              formDetail.content.length > 1000
            ) {
              throw new BadRequestError({
                message: FORMS_MESSAGES.CONTENT_MUST_BE_STRING_WITH_LENGTH_FROM_2_TO_1000,
                context: { api: 'createNewFormValidation' }
              })
            }

            if (typeof formDetail.index !== 'number') {
              throw new BadRequestError({
                message: FORMS_MESSAGES.FORM_DETAILS_INDEX_MUST_BE_NUMBER,
                context: { api: 'createNewFormValidation' }
              })
            }

            return true
          }
        }
      },
      users: {
        isArray: {
          errorMessage: FORMS_MESSAGES.USERS_MUST_BE_ARRAY
        },
        notEmpty: {
          errorMessage: FORMS_MESSAGES.USERS_MUST_NOT_BE_EMPTY
        },
        optional: true,
        custom: {
          options: (users) => {
            return users.every((user: string) => {
              return uuidFormat.test(user)
            })
          },
          errorMessage: FORMS_MESSAGES.USERS_KEY_MUST_BE_ARRAY_OF_UUID
        }
      }
    },
    ['body']
  )
)

export const getAllFormsValidator = validate(
  checkSchema({
    limit: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: FORMS_MESSAGES.LIMIT_MUST_BE_INTEGER_BETWEEN_1_AND_100
      }
    },
    page: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: FORMS_MESSAGES.PAGE_MUST_BE_INTEGER_GREATER_THAN_0
      }
    },
    order: {
      in: ['query'],
      optional: true,
      isString: {
        errorMessage: FORMS_MESSAGES.ORDER_MUST_BE_STRING
      },
      custom: {
        options: (value) => {
          if (!['ASC', 'DESC'].includes(value)) {
            throw new BadRequestError({
              message: FORMS_MESSAGES.INVALID_ORDER,
              context: { api: 'getAllFormsValidation' }
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
        errorMessage: FORMS_MESSAGES.ORDER_BY_MUST_BE_STRING
      },
      custom: {
        options: (value) => {
          if (!FormOrderByArray.includes(value)) {
            throw new BadRequestError({
              message: FORMS_MESSAGES.INVALID_ORDERBY,
              context: { api: 'getAllFormsValidation' }
            })
          }

          return true
        }
      }
    }
  })
)

export const formIdValidator = validate(
  checkSchema(
    {
      formId: {
        in: ['params'],
        isUUID: {
          errorMessage: FORMS_MESSAGES.FORM_ID_MUST_BE_UUID
        },
        custom: {
          options: async (value, { req }) => {
            const form = await formService.getFormById(value)

            if (!form) {
              throw new NotFoundError({
                message: FORMS_MESSAGES.FORM_NOT_FOUND,
                context: { api: 'formIdValidator' }
              })
            }
            req.form = form
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const cannotUpdateFormIfDeletedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { isDeleted } = req.form as Form
  const routePath = req.baseUrl + (req.route.path === '/' ? '' : req.route.path)

  if (isDeleted && routePath === '/api/forms/:formId' && req.method === 'PATCH') {
    return res.status(400).json({ message: FORMS_MESSAGES.FORM_IS_DELETED, result: null })
  }

  next()
}
