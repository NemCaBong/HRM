import { Router } from 'express'
import {
  addNewFormController,
  deleteFormController,
  getFormByIdController,
  getFormsController,
  undeleteFormController,
  updateFormController
} from '../controllers/forms.controllers'
import {
  cannotUpdateFormIfDeletedMiddleware,
  createNewFormValidator,
  formDetailValidator,
  formIdValidator,
  getAllFormsValidator
} from '../middlewares/forms.middlewares'
import { accessTokenValidator, haveAccessMiddleware } from '../middlewares/users.middlewares'
import { requestHandlerWrapper } from '../utils/handler'

const formsRouter = Router()

/**
 * @swagger
 * /forms:
 *  post:
 *    summary: Create a new form
 *    description: This endpoint allows for the creation of a new form.
 *    tags: [Forms]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                $ref: '#/components/schemas/FormNameSchema'
 *              description:
 *                $ref: '#/components/schemas/DescriptionSchema'
 *              total:
 *                $ref: '#/components/schemas/TotalSchema'
 *              form_details:
 *                $ref: '#/components/schemas/FormDetailsSchema'
 *    responses:
 *      201:
 *        description: Form created successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Create form successfully"
 *                result:
 *                  type: string
 *                  example: null
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
formsRouter.post(
  '/',
  accessTokenValidator,
  haveAccessMiddleware,
  createNewFormValidator,
  requestHandlerWrapper(addNewFormController)
)

/**
 * @swagger
 * /forms/{formId}:
 *  get:
 *    summary: Get a form by its ID
 *    description: This endpoint retrieves a form by its ID.
 *    tags: [Forms]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: formId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the form to retrieve
 *    responses:
 *      200:
 *        description: Form retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Get form details successfully"
 *                result:
 *                  type: object
 *                  description: The form details
 *      404:
 *        description: Form not found
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
formsRouter.get(
  '/:formId',
  accessTokenValidator,
  haveAccessMiddleware,
  formIdValidator,
  requestHandlerWrapper(getFormByIdController)
)

/**
 * @swagger
 * /forms:
 *  get:
 *    summary: Get all forms
 *    description: This endpoint retrieves all forms with pagination and optional sorting.
 *    tags: [Forms]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 10
 *        description: The number of items to return per page
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        description: The page number to return
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *          enum: [asc, desc]
 *        description: The order of the returned items
 *      - in: query
 *        name: orderBy
 *        schema:
 *         type: string
 *         enum: ['createdAt', 'updatedAt', 'name', 'total']
 *        description: The field to order the items by
 *    responses:
 *      200:
 *        description: Forms retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Get forms successfully"
 *                result:
 *                  type: array
 *                  items:
 *                    type: object
 *                    description: The form details
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *           schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Invalid or missing token"
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Internal Server Error"
 *                result:
 *                  type: string
 *                  example: "Sequelize error"
 */
formsRouter.get(
  '/',
  accessTokenValidator,
  haveAccessMiddleware,
  getAllFormsValidator,
  requestHandlerWrapper(getFormsController)
)

/**
 * @swagger
 * /forms/{formId}:
 *  patch:
 *    summary: Update a form
 *    description: This endpoint updates a form with the provided formId.
 *    tags: [Forms]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: formId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the form to update
 *    requestBody:
 *      description: The form details to update
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: The name of the form
 *              description:
 *                type: string
 *                description: The description of the form
 *              total:
 *                type: number
 *                description: The total number of items in the form
 *              form_details:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                      description: The ID of the form detail
 *                    content:
 *                      type: string
 *                      description: The content of the form detail
 *                    index:
 *                      type: number
 *                      description: The index of the form detail
 *    responses:
 *      200:
 *        description: Form updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Update form successfully"
 *                result:
 *                  type: null
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
formsRouter.patch(
  '/:formId',
  accessTokenValidator,
  haveAccessMiddleware,
  formIdValidator,
  cannotUpdateFormIfDeletedMiddleware,
  formDetailValidator,
  requestHandlerWrapper(updateFormController)
)

/**
 * @swagger
 * /forms/{formId}/delete:
 *  delete:
 *    summary: Delete a form
 *    description: This endpoint deletes a form with the provided formId.
 *    tags: [Forms]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: formId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the form to delete
 *    responses:
 *      200:
 *        description: Form deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Delete form successfully"
 *                result:
 *                  type: null
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "You don't have permission to access this resource"
 *                result:
 *                  type: object
 *                  properties:
 *                    message:
 *                      type: string
 *                      example: "Unauthorized access"
 *                    context:
 *                      type: object
 *                      example: { "reason": "Invalid token" }
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Internal server error"
 *                result:
 *                  type: object
 *                  properties:
 *                    message:
 *                      type: string
 *                      example: "An unexpected error occurred"
 */
formsRouter.delete(
  '/:formId/delete',
  accessTokenValidator,
  haveAccessMiddleware,
  formIdValidator,
  requestHandlerWrapper(deleteFormController)
)

/**
 * @swagger
 * /forms/{formId}/undelete:
 *   patch:
 *     tags:
 *       - Forms
 *     description: Undeletes a form
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: formId
 *         description: Form's id
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
 *         description: Internal Server Error - Could not undelete the form.
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
formsRouter.patch(
  '/:formId/undelete',
  accessTokenValidator,
  haveAccessMiddleware,
  formIdValidator,
  requestHandlerWrapper(undeleteFormController)
)

export default formsRouter
