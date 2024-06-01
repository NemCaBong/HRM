import { Router } from 'express'
import { reportFormByIdController } from '../controllers/reports.controller'
import { reportFormValidator } from '../middlewares/reports.middlewares'
import { accessTokenValidator, haveAccessMiddleware } from '../middlewares/users.middlewares'
import { requestHandlerWrapper } from '../utils/handler'
import { formIdValidator } from '../middlewares/forms.middlewares'

const reportsRouter = Router()

/**
 * @swagger
 * /reports/forms/{formId}:
 *  get:
 *    summary: Get a report of a form by ID
 *    description: This endpoint retrieves a report of a form with the provided formId.
 *    tags: [Reports]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: formId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the form to get a report for
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        required: false
 *        description: The page number for pagination
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: false
 *        description: The number of items per page for pagination
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *        required: false
 *        description: The order of the items (ASC or DESC)
 *      - in: query
 *        name: orderBy
 *        schema:
 *          type: string
 *        required: false
 *        description: The field to order the items by
 *      - in: query
 *        name: userStatus
 *        schema:
 *          type: string
 *        required: false
 *        description: The status of the user
 *      - in: query
 *        name: userFormStatus
 *        schema:
 *          type: string
 *        required: false
 *        description: The status of the user form
 *    responses:
 *      200:
 *        description: Report retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        description: The ID of the form
 *                      name:
 *                        type: string
 *                        description: The name of the form
 *                      description:
 *                        type: string
 *                        description: The description of the form
 *                      total:
 *                        type: number
 *                        description: The total number of items in the form
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
reportsRouter.get(
  '/forms/:formId',
  accessTokenValidator,
  haveAccessMiddleware,
  formIdValidator,
  reportFormValidator,
  requestHandlerWrapper(reportFormByIdController)
)

export default reportsRouter
