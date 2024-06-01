import { Router } from 'express'
import {
  changePasswordController,
  deleteUserController,
  getAllUserRolesController,
  getMeController,
  getUserController,
  getUserRoleByUserIdController,
  getUsers,
  loginController,
  refreshTokenController,
  undeleteUserController,
  updateMeController,
  updateStatusController,
  uploadAvatarController
} from '../controllers/users.controllers'
import {
  accessTokenValidator,
  accessUserMiddleware,
  changePasswordValidator,
  checkStatusValidator,
  haveAccessMiddleware,
  loginValidator,
  meAccessMiddleware,
  refreshTokenValidator,
  updateMeValidator,
  userIdValidator
} from '../middlewares/users.middlewares'
import { requestHandlerWrapper } from '../utils/handler'
import uploadMiddleware from '../utils/cloudinaryStorage'

const usersRouter = Router()

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to the system
 *     description: This endpoint allows the user to login to the system.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: The user's login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *             example:
 *               email: "john.doe@example.com"
 *               password: "@Hassword123"
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: The access token for the logged in user
 *                 refresh_token:
 *                   type: string
 *                   description: The refresh token for the logged in user
 *       '401':
 *         description: Unauthorized. Invalid login credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is invalid"
 *                 result:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Email is invalid"
 *                     context:
 *                       type: object
 *                       properties:
 *                         api:
 *                           type: string
 *                           example: "Login Middleware"
 *       '500':
 *         description: Internal Server Error - Could not login the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 *                 status:
 *                   type: integer
 *                   example: 500
 */
usersRouter.post('/login', loginValidator, requestHandlerWrapper(loginController))

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user's information
 *     description: This endpoint allows the current user to update their own information.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: The user's updated information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               last_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               first_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               insurance_number:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               citizen_id:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *               phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 15
 *               avatar:
 *                 type: string
 *                 format: binary
 *             example:
 *               last_name: "Doe"
 *               first_name: "John"
 *               address: "123 Main St"
 *               insurance_number: "123456789"
 *               citizen_id: "987654321"
 *               phone: "1234567890"
 *               avatar: "image.jpg"
 *     responses:
 *       '200':
 *         description: Update successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update successful"
 *                 result:
 *                   type: string
 *                   example: null
 *       '401':
 *         description: Unauthorized. User does not have permission to access this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You don't have permissions to access this resource."
 *                 result:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "/users"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not update the user's information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  meAccessMiddleware,
  updateMeValidator,
  requestHandlerWrapper(updateMeController)
)

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's information
 *     description: This endpoint allows the current user to get their own information.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Get me successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get me successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "4a02f31b-6581-4104-bcbe-2ec0afd1a646"
 *                     email:
 *                       type: string
 *                       example: "anhtp1@vmogroup.com"
 *                     firstName:
 *                       type: string
 *                       example: "Phương Anh"
 *                     lastName:
 *                       type: string
 *                       example: "Tô"
 *                     phone:
 *                       type: string
 *                       example: null
 *                     address:
 *                       type: string
 *                       example: null
 *                     avatar:
 *                       type: string
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: "OFFICIAL"
 *                     employeeId:
 *                       type: string
 *                       example: "2564"
 *                     insuranceNumber:
 *                       type: string
 *                       example: null
 *                     citizenId:
 *                       type: string
 *                       example: null
 *                     managerId:
 *                       type: string
 *                       example: null
 *       '401':
 *         description: Unauthorized. User does not have permission to access this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You don't have permissions to access this resource."
 *                 result:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "/users"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not get the user's information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.get('/me', accessTokenValidator, meAccessMiddleware, requestHandlerWrapper(getMeController))

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: This endpoint allows the retrieval of users from the system with pagination and sorting options.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The numbers of items to return.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to return.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: The order of the items to return. Can be 'asc' or 'desc'.
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: The field to order the items by.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: The status of the users to return.
 *     responses:
 *       '200':
 *         description: Get users successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get users successfully"
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
usersRouter.get('/', accessTokenValidator, haveAccessMiddleware, requestHandlerWrapper(getUsers))

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh user's access token
 *     description: This endpoint allows the user to refresh their access token using a valid refresh token.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: The user's refresh token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *     responses:
 *       '200':
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       '400':
 *         description: Bad Request. Invalid refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid refresh token"
 *                 result:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "/users"
 *                     message:
 *                       type: string
 *                       example: "Invalid refresh token"
 *       '500':
 *         description: Internal Server Error - Could not refresh the access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.post('/refresh-token', refreshTokenValidator, requestHandlerWrapper(refreshTokenController))

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change user's password
 *     description: This endpoint allows the user to change their password.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: The user's old password and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Change password successfully"
 *                 result:
 *                   type: string
 *                   example: null
 *       '400':
 *         description: Bad Request. Passwords do not match.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passwords do not match"
 *                 result:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "/users"
 *                     message:
 *                       type: string
 *                       example: "Passwords do not match"
 *       '500':
 *         description: Internal Server Error - Could not change the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.patch(
  '/change-password',
  accessTokenValidator,
  haveAccessMiddleware,
  changePasswordValidator,
  requestHandlerWrapper(changePasswordController)
)

usersRouter.get(
  '/user-roles',
  accessTokenValidator,
  haveAccessMiddleware,
  requestHandlerWrapper(getAllUserRolesController)
)

usersRouter.get(
  '/:userId/user-roles',
  accessTokenValidator,
  haveAccessMiddleware,
  requestHandlerWrapper(getUserRoleByUserIdController)
)

/**
 * @swagger
 * /users/{userId}/delete:
 *   delete:
 *     summary: Delete a user
 *     description: This endpoint allows the deletion of a user by their ID.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete user successfully"
 *                 result:
 *                   type: string
 *                   example: null
 *       '400':
 *         description: Bad Request. Invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user ID"
 *                 result:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "/users"
 *                     message:
 *                       type: string
 *                       example: "Invalid user ID"
 *       '500':
 *         description: Internal Server Error - Could not delete the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.delete(
  '/:userId/delete',
  accessTokenValidator,
  haveAccessMiddleware,
  userIdValidator,
  requestHandlerWrapper(deleteUserController)
)

/**
 * @swagger
 * /users/{userId}/undelete:
 *   patch:
 *     tags:
 *       - Users
 *     description: Undeletes a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: Access token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Undelete user successfully
 *       400:
 *         description: User is already undeleted
 *       500:
 *         description: Internal Server Error - Could not undelete the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.patch(
  '/:userId/undelete',
  accessTokenValidator,
  haveAccessMiddleware,
  userIdValidator,
  requestHandlerWrapper(undeleteUserController)
)

/**
 * @swagger
 * /users/{userId}/update-status:
 *   patch:
 *     summary: Update user's status
 *     description: This endpoint allows the user to update their status.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       description: The user's new status
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update status successfully"
 *                 result:
 *                   type: string
 *                   example: null
 *       '400':
 *         description: Bad Request. Invalid status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid status"
 *                 result:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "/users"
 *                     message:
 *                       type: string
 *                       example: "Invalid status"
 *       '500':
 *         description: Internal Server Error - Could not update the status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 */
usersRouter.patch(
  '/:userId/update-status',
  accessTokenValidator,
  haveAccessMiddleware,
  userIdValidator,
  checkStatusValidator,
  requestHandlerWrapper(updateStatusController)
)

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Retrieve a specific user
 *     description: This endpoint allows the retrieval of a specific user from the system.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve.
 *     responses:
 *       '200':
 *         description: Get user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get user successfully"
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 context:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: "getUserController"
 *       '500':
 *         description: Internal Server Error - Could not retrieve the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 result:
 *                   type: string
 *                   example: "Error message here detailing the issue"
 *                 status:
 *                   type: integer
 *                   example: 500
 */
usersRouter.get(
  '/:userId',
  accessTokenValidator,
  accessUserMiddleware,
  userIdValidator,
  haveAccessMiddleware,
  requestHandlerWrapper(getUserController)
)

const upload = uploadMiddleware('avatars_vmo')
usersRouter.patch(
  '/me/avatar',
  accessTokenValidator,
  haveAccessMiddleware,
  upload.single('avatar'),
  requestHandlerWrapper(uploadAvatarController)
)

export default usersRouter
