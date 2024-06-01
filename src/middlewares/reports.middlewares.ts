import { checkSchema } from 'express-validator'
import { UserFormOrderByArray } from '../constants/order'
import { USER_FORMS_STATUS_VALUES, USER_STATUS_VALUES } from '../constants/status'
import { validate } from './common.middlewares'

export const reportFormValidator = validate(
  checkSchema({
    limit: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 50 }
      },
      notEmpty: true
    },
    page: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1 }
      },
      notEmpty: true
    },
    userStatus: {
      in: ['query'],
      optional: true,
      isString: true,
      notEmpty: true,
      isIn: {
        options: [USER_STATUS_VALUES],
        errorMessage: `User status must be one of ${USER_STATUS_VALUES.join(', ')}`
      }
    },
    userFormStatus: {
      in: ['query'],
      optional: true,
      isString: true,
      notEmpty: true,
      isIn: {
        options: [USER_FORMS_STATUS_VALUES],
        errorMessage: `User form status must be one of ${USER_FORMS_STATUS_VALUES.join(', ')}`
      }
    },
    order: {
      in: ['query'],
      optional: true,
      isString: true,
      notEmpty: true,
      isIn: {
        options: [['ASC', 'DESC']],
        errorMessage: 'Order must be either ASC or DESC'
      }
    },
    orderBy: {
      in: ['query'],
      optional: true,
      isString: true,
      notEmpty: true,
      isIn: {
        options: [UserFormOrderByArray],
        errorMessage: `Order by must be one of ${UserFormOrderByArray.join(', ')}`
      }
    }
  })
)
