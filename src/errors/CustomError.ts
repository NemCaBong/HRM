export type CustomErrorContent = {
  message: string
  context?: { [key: string]: any }
}

export abstract class CustomError {
  readonly statusCode: number
  abstract readonly errors: CustomErrorContent[]
  abstract readonly logging: boolean
  readonly message: string

  constructor({ message, statusCode }: { message: string; statusCode: number }) {
    this.message = message
    this.statusCode = statusCode
    // extending a built in class
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}
