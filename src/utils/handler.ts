import { Request, Response, NextFunction } from 'express'
import { RequestHandler } from 'express-serve-static-core'
import { CustomError } from '../errors/CustomError'
import multer from 'multer'

// This function is used to wrap the controller functions to catch the error and pass it to the error handler middleware
export const requestHandlerWrapper = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err
    if (logging) {
      console.error(JSON.stringify({ statusCode: err.statusCode, errors: err.errors }, null, 2))
    }

    return res.status(statusCode).json({ message: err.message, result: errors, status: statusCode })
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Multer error', result: [err], status: 400 })
  }
  console.log(err)
  return res.status(500).json({ message: 'Internal Server Error', result: [...err], status: 500 })
}
