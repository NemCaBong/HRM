import { Router } from 'express'
import {
  submitUserFormController,
  getUserFormByIdController,
  updateUserFormController,
  approveUserFormController,
  getUserForms,
  rejectUserFormController,
  closeUserFormController,
  deleteUserFormController,
  undeleteUserFormController,
  assignUserFormController
} from '../controllers/userforms.controllers'
import { mustHaveReqBody } from '../middlewares/common.middlewares'
import {
  assignUserFormValidator,
  cannotUpdateUserFormIfDeletedMiddleware,
  getUserFormsValidator,
  isApprovedMiddleware,
  isOwnerUserFormMiddleware,
  isPendingApprovalMiddleware,
  submitUserFormDetailValidator,
  userFormIdValidator
} from '../middlewares/userforms.middlewares'
import { accessTokenValidator, isDirectManagerMiddleware, haveAccessMiddleware } from '../middlewares/users.middlewares'
import { accessUserFormMiddleware } from '../middlewares/userforms.middlewares'
import { requestHandlerWrapper } from '../utils/handler'

const userFormsRouter = Router()

/**
 * @swagger
 * /user-forms:
 *   get:
 *     summary: Retrieve a list of user forms based on query parameters
 *     description: This endpoint retrieves user forms with pagination and optional filters.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: Limit number of user forms returned (default is 10).
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination (default is 1).
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by the status of the user forms. Must be a valid status.
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: ['ASC', 'DESC']
 *         description: Order direction of the results (ASC for ascending, DESC for descending).
 *       - name: orderBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: ['createdAt', 'updatedAt', 'filledAt']
 *         description: Field name to sort by. Must be a valid field name.
 *     responses:
 *       '200':
 *         description: A list of user forms along with pagination details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get user forms successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "44d50af8-e138-4639-8add-0b01df7c27be"
 *                       userId:
 *                         type: string
 *                         example: "78e2c13f-29e1-4b77-a68b-7d6fd23b415c"
 *                       formId:
 *                         type: string
 *                         example: "1e7ec5c6-9e1a-40be-a218-f5248c061f80"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-13T22:59:07.497Z"
 *                       createdBy:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: "PENDING_APPROVAL"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                       deletedBy:
 *                         type: string
 *                       filledAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-15T04:33:52.212Z"
 *                       updatedBy:
 *                         type: string
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       form:
 *                         $ref: '#/components/schemas/Form'
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error occurred"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Description of the validation error.
 *                       param:
 *                         type: string
 *                         description: Name of the parameter that failed validation.
 *                       location:
 *                         type: string
 *                         description: Location of the parameter (e.g., query).
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not fetch the user forms.
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
userFormsRouter.get(
  '/',
  accessTokenValidator,
  haveAccessMiddleware,
  getUserFormsValidator,
  requestHandlerWrapper(getUserForms)
)

/**
 * @swagger
 * /user-forms/{userFormId}:
 *   get:
 *     summary: Retrieve a specific user form by ID
 *     description: This endpoint retrieves a specific user form by its ID.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userFormId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user form to retrieve.
 *     responses:
 *       '200':
 *         description: Get user form details successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get user form details successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "REJECTED"
 *                     filledAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-09T00:05:00.340Z"
 *                     userFormDetails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           answer:
 *                             type: string
 *                           evaluation:
 *                             type: string
 *                           formDetailsId:
 *                             type: string
 *                     form:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         total:
 *                           type: integer
 *                         formDetails:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               content:
 *                                 type: string
 *                               index:
 *                                 type: integer
 *                     userFormId:
 *                       type: string
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not fetch the user forms.
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
userFormsRouter.get(
  '/:userFormId',
  accessTokenValidator,
  haveAccessMiddleware,
  accessUserFormMiddleware,
  userFormIdValidator,
  requestHandlerWrapper(getUserFormByIdController)
)

userFormsRouter.post(
  '/assign',
  accessTokenValidator,
  haveAccessMiddleware,
  assignUserFormValidator,
  requestHandlerWrapper(assignUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}:
 *   post:
 *     summary: Submit a user form by ID
 *     description: This endpoint allows a user to submit a form by its ID.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userFormId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user form to submit.
 *     requestBody:
 *       description: The user form details to submit
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               minLength: 2
 *               maxLength: 1000
 *             example:
 *               "47d69bdd-12db-4059-ad58-0b0c60ea3fed": "C-section"
 *               "7c7c8c4f-78f9-4436-8daa-65e5c6026084": "PM"
 *     responses:
 *       '201':
 *         description: Submit form successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Submit form successfully"
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not submit the user form.
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
userFormsRouter.post(
  '/:userFormId',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  isOwnerUserFormMiddleware, // phải là owner mới đc submit
  submitUserFormDetailValidator,
  mustHaveReqBody,
  requestHandlerWrapper(submitUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}:
 *   patch:
 *     summary: Update a user form by ID
 *     description: This endpoint allows a user to update a form by its ID.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userFormId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user form to update.
 *     requestBody:
 *       description: The user form details to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               minLength: 2
 *               maxLength: 1000
 *             example:
 *               "47d69bdd-12db-4059-ad58-0b0c60ea3fed": "C-section"
 *               "7c7c8c4f-78f9-4436-8daa-65e5c6026084": "PM"
 *     responses:
 *       '200':
 *         description: Update form successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update form successfully"
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not update the user form.
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
userFormsRouter.patch(
  '/:userFormId',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  isOwnerUserFormMiddleware, // owner mới đc update
  submitUserFormDetailValidator,
  cannotUpdateUserFormIfDeletedMiddleware,
  mustHaveReqBody,
  requestHandlerWrapper(updateUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}/approve:
 *   patch:
 *     summary: Approve a user form by ID
 *     description: This endpoint allows a user to approve a form by its ID.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userFormId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user form to approve.
 *     requestBody:
 *       description: The user form details to approve
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               minLength: 2
 *               maxLength: 1000
 *             example:
 *               "47d69bdd-12db-4059-ad58-0b0c60ea3fed": "C-section"
 *               "7c7c8c4f-78f9-4436-8daa-65e5c6026084": "PM"
 *     responses:
 *       '200':
 *         description: Approve form successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Approve form successfully"
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not approve the user form.
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
userFormsRouter.patch(
  '/:userFormId/approve',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  isDirectManagerMiddleware('userFormId'),
  isPendingApprovalMiddleware,
  submitUserFormDetailValidator,
  mustHaveReqBody,
  requestHandlerWrapper(approveUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}/reject:
 *   patch:
 *     summary: Reject a user form by ID
 *     description: This endpoint allows a user to reject a form by its ID.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userFormId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user form to reject.
 *     responses:
 *       '200':
 *         description: Reject form successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reject form successfully"
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not reject the user form.
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
userFormsRouter.patch(
  '/:userFormId/reject',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  isDirectManagerMiddleware('userFormId'),
  submitUserFormDetailValidator,
  mustHaveReqBody,
  isPendingApprovalMiddleware,
  requestHandlerWrapper(rejectUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}/close:
 *   patch:
 *     summary: Close a user form by ID
 *     description: This endpoint allows a user to close a form by its ID.
 *     tags:
 *       - User Forms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userFormId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user form to close.
 *     responses:
 *       '200':
 *         description: Close form successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Close form successfully"
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
 *                       example: "/user-forms"
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       '500':
 *         description: Internal Server Error - Could not close the user form.
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
userFormsRouter.patch(
  '/:userFormId/close',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  isApprovedMiddleware,
  requestHandlerWrapper(closeUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}/delete:
 *   delete:
 *     tags:
 *       - User Forms
 *     description: Deletes a user form
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userFormId
 *         description: UserForm's id
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
 *         description: Delete form successfully
 *       400:
 *         description: Form is already deleted
 *       500:
 *         description: Internal Server Error - Could not close the user form.
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
userFormsRouter.delete(
  '/:userFormId/delete',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  requestHandlerWrapper(deleteUserFormController)
)

/**
 * @swagger
 * /user-forms/{userFormId}/undelete:
 *   patch:
 *     tags:
 *       - User Forms
 *     description: Undeletes a user form
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userFormId
 *         description: UserForm's id
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
 *         description: Undelete form successfully
 *       400:
 *         description: Form is already undeleted
 *       500:
 *         description: Internal Server Error - Could not undelete the user form.
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
userFormsRouter.patch(
  '/:userFormId/undelete',
  accessTokenValidator,
  haveAccessMiddleware,
  userFormIdValidator,
  requestHandlerWrapper(undeleteUserFormController)
)

export default userFormsRouter
