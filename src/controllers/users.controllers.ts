import { Request, Response } from 'express'
import User from '../models/User.model'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '../services/users.services'
import { LoginReqBody, TokenPayload } from '../models/requests/User.requests'
import { getPagination } from '../utils/pagination'
import { createOrderArray } from '../utils/order'
import { UserStatus } from '../constants/enums'
import BadRequestError from '../errors/BadRequestError'
import { ROLE_HIERARCHY } from '../constants/roles'

/**
 * Controller for user login.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the user object.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the login result
 */
export const loginController = async (
  req: Request<ParamsDictionary, unknown, LoginReqBody>,
  res: Response
): Promise<Response> => {
  console.log()
  const { id } = req.user as User
  const { roles } = await usersService.getRoles(id)
  const { access_token, refresh_token } = await usersService.login(id, roles)
  return res.json({ access_token, refresh_token })
}

/**
 * Controller for updating the current user's information.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the decoded authorization and the updated information in the body.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the message 'Update successful'
 */
export const updateMeController = async (req: Request, res: Response): Promise<Response> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const updatedInfo = req.body

  await usersService.updateMe(user_id, updatedInfo)

  return res.status(200).json({ message: 'Update successful', result: null })
}

/**
 * Controller for getting the current user's information.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the decoded authorization.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the current user's information
 */
export const getMeController = async (req: Request, res: Response): Promise<Response> => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMe(user_id)

  return res.status(200).json({ message: 'Get me successfully', result })
}

/**
 * Controller for getting users.
 * @async
 * @param {Request} req - Express request object. The request may contain limit, page, order, orderBy, status in the query.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the users data
 */
export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  const {
    limit,
    page,
    order = '',
    orderBy = '',
    status = 'ALL',
    managerId,
    email,
    employeeId,
    isDeleted,
    firstName,
    lastName
  } = req.query
  const pagination = getPagination({ limit: Number(limit), page: Number(page) })

  const orderArray = createOrderArray(orderBy as string, order as string)

  const result = await usersService.getUsers({
    pagination,
    orderArray,
    filter: {
      status: status as UserStatus,
      managerId: managerId as string,
      email: email as string,
      employeeId: employeeId as string,
      isDeleted: Boolean(isDeleted),
      firstName: firstName as string,
      lastName: lastName as string
    }
  })

  return res.status(200).json({ message: 'Get users successfully', result })
}

/**
 * Controller for refreshing the user's token.
 * @async
 * @param {Request} req - Express request object. The request should contain the refresh token in the body and the user ID, expiration time, roles in the decoded refresh token.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the refreshed token
 */
export const refreshTokenController = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.body
  const { user_id: userId, exp, roles } = req.decoded_refresh_token as TokenPayload

  console.log(await usersService.getPermissionsByRoles(roles))

  const { access_token, refresh_token } = await usersService.refreshToken({ userId, refreshToken, exp, roles })

  return res.status(200).json({ access_token, refresh_token })
}

/**
 * Controller for changing the user's password.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the decoded authorization and the old and new passwords in the body.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the message 'Change password successfully'
 */
export const changePasswordController = async (req: Request, res: Response): Promise<Response> => {
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  const { oldPassword, password } = req.body

  await usersService.changePassword({ userId, oldPassword, password })

  return res.status(200).json({ message: 'Change password successfully', result: null })
}

/**
 * Controller for deleting a user.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the parameters.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the message 'Delete user successfully'
 */
export const deleteUserController = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params
  const { isDeleted } = (await usersService.getUser(userId)) as User

  if (isDeleted) {
    return res.status(400).json({ message: 'User is already deleted', result: null })
  }

  await usersService.deleteUser(userId)

  return res.status(200).json({ message: 'Delete user successfully', result: null })
}

/**
 * Controller for updating a user's status.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the parameters and the new status in the body.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the message 'Update status successfully'
 */
export const updateStatusController = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params
  const { status } = req.body

  await usersService.updateStatus(userId, status)

  return res.status(200).json({ message: 'Update status successfully', result: null })
}

/**
 * Controller for getting a user by ID.
 * @async
 * @param {Request} req - Express request object. The request should contain the user ID in the parameters.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the user data
 */
export const getUserController = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params
  const { roles } = req.decoded_authorization as TokenPayload
  const highestRole = Math.max(...roles.map((role) => ROLE_HIERARCHY[role]))

  const result = await usersService.getUser(userId)

  if (highestRole === ROLE_HIERARCHY['Manager'] && result?.isDeleted)
    return res.status(204).json({ message: 'User is deleted', result: null })

  return res.status(200).json({ message: 'Get user successfully', result })
}

/**
 * Controller for undeleting a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 *
 * @returns {Promise<Response>} The response object.
 *
 * @throws {400} If the user is already undeleted.
 * @throws {500} If there is an error in the service layer.
 */
export const undeleteUserController = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params
  const { isDeleted } = (await usersService.getUser(userId)) as User

  if (!isDeleted) {
    return res.status(400).json({ message: 'User is already undeleted', result: null })
  }
  await usersService.undeleteUser(userId)

  return res.status(200).json({ message: 'Undelete user successfully', result: null })
}

/**
 * Controller for uploading a user avatar.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 *
 * @returns {Promise<Response>} The response object.
 *
 * @throws {BadRequestError} If no file is provided in the request.
 */
export const uploadAvatarController = async (req: Request, res: Response): Promise<Response> => {
  console.log(req.file)
  if (!req.file) {
    throw new BadRequestError({ message: 'Please upload an image', context: { api: 'uploadAvatarController' } })
  }

  const fileUrl = req.file.path
  console.log(fileUrl)
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  await usersService.uploadAvatar(userId, fileUrl)

  return res.status(200).json({ message: 'Upload avatar successfully', result: fileUrl })
}

export const getAllUserRolesController = async (req: Request, res: Response) => {
  const { order = '', orderBy = '', firstName, lastName, email, status, limit, page, employeeId } = req.query

  const pagination = getPagination({ limit: Number(limit), page: Number(page) })
  const orderArray = createOrderArray(orderBy as string, order as string)

  const result = await usersService.getAllUserRoles({
    orderArray,
    pagination,
    filter: {
      firstName: firstName as string,
      lastName: lastName as string,
      email: email as string,
      status: status as UserStatus,
      employeeId: employeeId as string
    }
  })

  res.status(200).json({ message: 'Get all user roles of an user successfully', result })
}

export const getUserRoleByUserIdController = async (req: Request, res: Response) => {
  const { userId } = req.params
  const result = await usersService.getUserRoleByUserId(userId)
  res.status(200).json({ message: 'Get user role of an user successfully', result })
}
