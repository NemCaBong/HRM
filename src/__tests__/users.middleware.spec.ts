import express, { NextFunction, Request, Response } from 'express'
import {
  accessTokenValidator,
  haveAccessMiddleware,
  isDirectManagerMiddleware,
  loginValidator,
  refreshTokenValidator
} from '../middlewares/users.middlewares'
import { verifyToken } from '../utils/jwt'
import { USERS_MESSAGES } from '../constants/messages'
import request from 'supertest'
import { handleValidationErrors } from '../middlewares/common.middlewares'
import { defaultErrorHandler } from '../utils/handler'
import { JsonWebTokenError } from 'jsonwebtoken'
import RefreshToken from '../models/RefreshToken.model'
import usersService from '../services/users.services'
import combinePermissions from '../utils/combineRoles'
import { TokenType } from '../constants/enums'
import AuthorizationError from '../errors/AuthorizationError'
import User from '../models/User.model'
import userFormService from '../services/userforms.services'
import bcrypt from 'bcrypt'

// Mock the verifyToken function
jest.mock('../utils/jwt', () => ({
  verifyToken: jest.fn()
}))

jest.mock('../models/RefreshToken.model', () => ({
  findOne: jest.fn()
}))
jest.mock('../services/users.services')
jest.mock('../utils/combineRoles')
jest.mock('../services/userforms.services')
jest.mock('bcrypt')
jest.mock('../models/User.model')

const app = express()
app.use(express.json())

app.get('/test', accessTokenValidator, handleValidationErrors, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Success', decodedAuthorization: req.decoded_authorization })
})
app.post('/refresh-token', refreshTokenValidator, handleValidationErrors, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Success', decodedRefreshToken: req.decoded_refresh_token })
})
// app.post('/users/login', loginValidator, handleValidationErrors, (req: Request, res: Response) => {
//   res.status(200).json({ message: 'Success' })
// })

app.use(defaultErrorHandler)

describe('accessTokenMiddleware', () => {
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGEwMmYzMWItNjU4MS00MTA0LWJjYmUtMmVjMGFmZDFhNjQ2IiwidG9rZW5fdHlwZSI6MCwicm9sZXMiOlsiSFIiLCJFbXBsb3llZSJdLCJpYXQiOjE3MTYwODQ5OTgsImV4cCI6MTcxNjA4NTU5OH0.TLgXT7SyyuUM8udLocJewRK6DRg8pMn8ZEfZJdxJF_4'

  const invalidToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGEwMmYzMWItNjU4MS00MTA0LWJjYmUtMmVjMGFmZDFhNjQ2IiwidG9rZW5fdHlwZSI6MCwicm9sZXMiOlsiSFIiLCJFbXBsb3llZSJdLCJpYXQEOjE3MTYwODQ5OTgsImV4cCI6MTcxNjA4NTU5OH0.TLgXT7SyyuUM8udLocJewRK6DRg8pMn8ZEfZJdxJF_4'
  afterEach(() => {
    jest.clearAllMocks() // Clear all mocks after each test
  })

  it('should call next if token is valid', async () => {
    ;(verifyToken as jest.Mock).mockResolvedValueOnce({ userId: '123' })

    const response = await request(app).get('/test').set('Authorization', `Bearer ${validToken}`)

    expect(response.status).toBe(200)
  })

  it('should respond with 401 if token is missing', async () => {
    const response = await request(app).get('/test')
    expect(response.status).toBe(401)
  })

  it('should respond with 422 if token is invalid', async () => {
    ;(verifyToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'))

    const response = await request(app).get('/test').set('Authorization', `Bearer ${invalidToken}`)
    expect(response.status).toBe(422)
  })
})

// describe('refreshTokenMiddleware', () => {
//   const validToken =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGEwMmYzMWItNjU4MS00MTA0LWJjYmUtMmVjMGFmZDFhNjQ2IiwidG9rZW5fdHlwZSI6MCwicm9sZXMiOlsiSFIiLCJFbXBsb3llZSJdLCJpYXQEOjE3MTYwODQ5OTgsImV4cCI6MTcxNjA4NTU5OH0.TLgXT7SyyuUM8udLocJewRK6DRg8pMn8ZEfZJdxJF_4'
//   const invalidToken = 'invalid-refresh-token'

//   afterEach(() => {
//     jest.clearAllMocks() // Clear all mocks after each test
//   })

//   it('should respond with 401 if refresh token is missing', async () => {
//     const response = await request(app).post('/refresh-token')
//     expect(response.status).toBe(401)
//     expect(response.body.message).toBe(USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED)
//   })

//   it('should respond with 401 if refresh token is invalid', async () => {
//     ;(verifyToken as jest.Mock).mockRejectedValueOnce(new JsonWebTokenError('Invalid token'))

//     const response = await request(app).post('/refresh-token').send({ refreshToken: invalidToken })

//     expect(response.status).toBe(401)
//     expect(response.body.message).toBe(USERS_MESSAGES.INVALID_REFRESH_TOKEN)
//   })

//   it('should respond with 404 if refresh token is not found in the database', async () => {
//     ;(verifyToken as jest.Mock).mockResolvedValueOnce({ userId: '123' })
//     ;(RefreshToken.findOne as jest.Mock).mockResolvedValueOnce(null)

//     const response = await request(app).post('/refresh-token').send({ refreshToken: validToken })

//     expect(response.status).toBe(404)
//     expect(response.body.message).toBe(USERS_MESSAGES.REFRESH_TOKEN_NOT_FOUND)
//   })

//   it('should call next if refresh token is valid and exists in the database', async () => {
//     const mockDecodedToken = { userId: '123', roles: ['Employee'] }
//     const mockRefreshToken = { token: validToken }
//     ;(verifyToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken)
//     ;(RefreshToken.findOne as jest.Mock).mockResolvedValueOnce(mockRefreshToken)

//     const response = await request(app).post('/refresh-token').send({ refreshToken: validToken })
//     console.log(response.body.result[0].context)
//     expect(response.status).toBe(200)
//     expect(response.body.decodedRefreshToken).toEqual(mockDecodedToken)
//   })
// })

describe('haveAccessMiddleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction
  let mockUsersService: jest.Mocked<typeof usersService>
  let mockCombinePermissions: jest.MockedFunction<typeof combinePermissions>

  afterEach(() => {
    jest.clearAllMocks() // Clear all mocks after each test
  })
  beforeEach(() => {
    req = {}
    res = {}
    next = jest.fn()
    mockUsersService = usersService as jest.Mocked<typeof usersService>
    mockCombinePermissions = combinePermissions as jest.MockedFunction<typeof combinePermissions>
  })

  it('should call next() if role includes Admin', async () => {
    req.decoded_authorization = {
      roles: ['Admin'],
      user_id: '123',
      token_type: TokenType.RefreshToken,
      exp: 123,
      iat: 123
    }

    await haveAccessMiddleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should throw an AuthorizationError if no permission', async () => {
    req.decoded_authorization = {
      roles: ['Employee'],
      user_id: '123',
      token_type: TokenType.RefreshToken,
      exp: 123,
      iat: 123
    }
    req.method = 'GET'
    req.baseUrl = '/users'
    req.route = { path: '/' }
    mockCombinePermissions.mockReturnValue([
      {
        api: '/users',
        isCanRead: false,
        isCanAdd: false,
        isCanEdit: false,
        isCanDelete: false,
        isCanApprove: false
      }
    ])
    await haveAccessMiddleware(req as Request, res as Response, next)
    expect(next).toHaveBeenCalledWith(
      new AuthorizationError({
        message: 'You do not have permission to access this resource',
        context: {
          api: 'haveAccessMiddleware'
        }
      })
    )
  })

  it('should call next() if user has the necessary permissions', async () => {
    req.decoded_authorization = {
      roles: ['Employee'],
      user_id: '123',
      token_type: TokenType.RefreshToken,
      exp: 123,
      iat: 123
    }
    req.method = 'GET'
    req.baseUrl = '/api'
    req.route = { path: '/users' }

    mockCombinePermissions.mockReturnValue([
      {
        api: '/users',
        isCanRead: true,
        isCanAdd: false,
        isCanEdit: false,
        isCanDelete: false,
        isCanApprove: false
      }
    ])
    await haveAccessMiddleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
  })
})

describe('isDirectManagerMiddleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction
  let mockUsersService: jest.Mocked<typeof usersService>
  let mockUserFormService: jest.Mocked<typeof userFormService>

  beforeEach(() => {
    req = {}
    res = {}
    next = jest.fn()
    mockUsersService = usersService as jest.Mocked<typeof usersService>
    mockUserFormService = userFormService as jest.Mocked<typeof userFormService>
  })

  it('should call next() if role includes Admin', async () => {
    req.decoded_authorization = {
      roles: ['Admin'],
      user_id: '123',
      token_type: TokenType.RefreshToken,
      exp: 123,
      iat: 123
    }

    await isDirectManagerMiddleware('userId')(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should call next() if user is the direct manager', async () => {
    req.decoded_authorization = {
      roles: ['Manager'],
      user_id: '123',
      token_type: TokenType.RefreshToken,
      exp: 123,
      iat: 123
    }
    req.params = { userId: '456' }
    mockUsersService.getManager.mockResolvedValue({ id: '123' } as User)

    await isDirectManagerMiddleware('userId')(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should throw an AuthorizationError if user is not the direct manager', async () => {
    req.decoded_authorization = {
      roles: ['Manager'],
      user_id: '123',
      token_type: TokenType.RefreshToken,
      exp: 123,
      iat: 123
    }
    req.params = { userId: '456' }
    mockUsersService.getManager.mockResolvedValue({ id: '789' } as User)

    await isDirectManagerMiddleware('userId')(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(
      new AuthorizationError({
        message: 'You do not have permission to access this resource',
        context: {
          api: 'isDirectManagerMiddleware'
        }
      })
    )
  })

  // Add similar test cases for 'userFormId'...
})

// describe('POST /users/login', () => {
//   let mockUser: jest.Mocked<typeof User>
//   let mockBcrypt: jest.Mocked<typeof bcrypt>

//   beforeEach(() => {
//     mockUser = User as jest.Mocked<typeof User>
//     mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
//   })

//   it('responds with json and status 200 when login is successful', async () => {
//     mockUser.findOne.mockResolvedValue({ get: () => 'hashedPassword', dataValues: {} } as any)
//     mockBcrypt.compareSync.mockReturnValue(true)

//     const response = await request(app)
//       .post('/users/login')
//       .send({ email: 'hoangnm2@vmogroup.com', password: 'Ha1@234554' })

//     expect(response.status).toBe(200)
//     expect(response.body).toEqual({ message: 'Success' })
//   })

//   it('responds with json and status 400 when email is not found', async () => {
//     mockUser.findOne.mockResolvedValue(null)

//     const response = await request(app).post('/users/login').send({ email: 'test@example.com', password: '@hoang!' })

//     expect(response.status).toBe(400)
//   })

//   it('responds with json and status 401 when password is incorrect', async () => {
//     mockUser.findOne.mockResolvedValue({ get: () => 'hashedPassword', dataValues: {} } as any)
//     mockBcrypt.compareSync.mockReturnValue(false)

//     const response = await request(app)
//       .post('/users/login')
//       .send({ email: 'hoangnm2@vmogroup.com', password: '@hoang21' })

//     expect(response.status).toBe(403)
//   })
// })
