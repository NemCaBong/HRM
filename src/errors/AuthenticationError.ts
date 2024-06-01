import { CustomError } from './CustomError'

export default class AuthenticationError extends CustomError {
  private static readonly _statusCode = 403
  private readonly _code: number
  private readonly _logging: boolean
  private readonly _context: { [key: string]: any }

  constructor(params?: { code?: number; message?: string; logging?: boolean; context?: { [key: string]: any } }) {
    const { code, message, logging } = params || {}

    super({ message: message || 'Authentication Error', statusCode: code || AuthenticationError._statusCode })
    this._code = code || AuthenticationError._statusCode
    this._logging = logging || false
    this._context = params?.context || {}

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }

  get errors() {
    return [{ message: this.message, context: this._context }]
  }

  get getStatusCode() {
    return this._code
  }

  get logging() {
    return this._logging
  }
}
