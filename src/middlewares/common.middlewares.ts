import { validationResult, ValidationError, ValidationChain } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors/CustomError'
import ExpressValidationError from '../errors/ValidationError'
import BadRequestError from '../errors/BadRequestError'
import { requestHandlerWrapper } from '../utils/handler'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'

export const handleValidationErrors = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errorsObject = errors.mapped()
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      if (msg instanceof CustomError) {
        return next(msg)
      }
    }

    const validationErrors: ValidationError[] = errors.array()
    // const errorMessages = validationErrors.map((error) => error.msg)
    const customError = new ExpressValidationError({
      message: 'Validation Error',
      context: { error: validationErrors }
    })
    return next(customError)
  }

  next()
}

export const mustHaveReqBody = requestHandlerWrapper((req: Request, res: Response, next: NextFunction) => {
  if (Object.keys(req.body).length === 0) {
    return next(new BadRequestError({ message: 'Request body is required', context: { api: 'mustHaveReqBody' } }))
  }

  next()
})

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // run xong hết các validation
    await validation.run(req)
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const errorsObject = errors.mapped()
      for (const key in errorsObject) {
        const { msg } = errorsObject[key]

        if (msg instanceof CustomError) {
          return next(msg)
        }
      }

      const validationErrors: ValidationError[] = errors.array()
      // const errorMessages = validationErrors.map((error) => error.msg)
      const customError = new ExpressValidationError({
        message: 'Validation Error',
        context: { error: validationErrors }
      })
      return next(customError)
    }

    next()
  }
}
