import { Request, Response } from 'express'
import { FormOrderByType, OrderType } from '../constants/order'
import { TokenPayload } from '../models/requests/User.requests'
import formService from '../services/forms.services'
import { getPagination } from '../utils/pagination'
import Form from '../models/Form.model'

/**
 * Controller for adding a new form.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with status 201 and a success message
 */
export const addNewFormController = async (req: Request, res: Response): Promise<Response> => {
  const { user_id: userId } = req.decoded_authorization as TokenPayload
  await formService.addNewForm(userId, req.body)

  return res.status(201).json({ message: 'Create form successfully', result: null })
}

/**
 * Controller for getting a form by its ID.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the form details or a 404 error message
 */
export const getFormByIdController = async (req: Request, res: Response): Promise<Response> => {
  const { formId } = req.params

  const result = await formService.getFormWithDetails(formId)

  return res.status(200).json({ message: 'Get form details successfully', result })
}

/**
 * Controller for getting all forms.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the forms
 */
export const getFormsController = async (req: Request, res: Response): Promise<Response> => {
  const { limit = 10, page = 1, order, orderBy, name } = req.query
  const pagination = getPagination({ page: Number(page), limit: Number(limit) })

  const result = await formService.getForms({
    pagination: pagination,
    order: order as OrderType,
    orderBy: orderBy as FormOrderByType,
    filter: { name: name as string }
  })
  return res.status(200).json({ message: 'Get forms successfully', result })
}

/**
 * Controller for updating a form.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with status 200 and a success message
 */
export const updateFormController = async (req: Request, res: Response): Promise<Response> => {
  const { formId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  await formService.updateForm({
    formId,
    updatedData: req.body,
    userId
  })
  return res.status(200).json({ message: 'Update form successfully', result: null })
}

/**
 * Controller for deleting a form.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with status 200 and a success message
 */
export const deleteFormController = async (req: Request, res: Response): Promise<Response> => {
  const { formId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  const form = (await formService.getFormById(formId)) as Form

  if (form.isDeleted) {
    return res.status(200).json({ message: 'Form is already deleted', result: null })
  }

  await formService.deleteFormAndUserFormByFormId(formId, userId)

  return res.status(200).json({ message: 'Delete form successfully', result: null })
}

/**
 * Controller for undeleting a form.
 *
 * @param {Request} req - The request object, containing the form ID in the parameters and the user ID in the decoded authorization.
 * @param {Response} res - The response object.
 *
 * @returns {Promise<Response>} The response object.
 *
 * @throws {200} If the form is already undeleted.
 * @throws {500} If there is an error in the service layer.
 */
export const undeleteFormController = async (req: Request, res: Response): Promise<Response> => {
  const { formId } = req.params

  const form = (await formService.getFormById(formId)) as Form

  if (!form.isDeleted) {
    return res.status(400).json({ message: 'Form is already undeleted', result: null })
  }

  await formService.undeleteForm(formId)

  return res.status(200).json({ message: 'Undelete form successfully', result: null })
}
