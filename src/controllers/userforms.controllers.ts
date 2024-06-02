import { Request, Response } from 'express'
import { USER_FORMS_STATUS, UserFormStatusType } from '../constants/status'
import userFormService from '../services/userforms.services'
import { getPagination } from '../utils/pagination'
import { TokenPayload } from '../models/requests/User.requests'
import { ROLE_HIERARCHY } from '../constants/roles'
import { createOrderArray } from '../utils/order'
import UserForm from '../models/UserForm.model'

/**
 * Controller for getting user forms.
 * @async
 * @param {Request} req - Express request object. The request may contain limit, page, status, order, orderBy in the query.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the user forms data
 */
export const getUserForms = async (req: Request, res: Response): Promise<Response> => {
  const { roles, user_id: requestedUserId } = req.decoded_authorization as TokenPayload
  const {
    limit = 10,
    page = 1,
    order = 'ASC',
    orderBy = 'createdAt',
    userFormStatus,
    userId,
    formId,
    userStatus,
    name
  } = req.query

  const pagination = getPagination({ limit: Number(limit), page: Number(page) })
  const orderArray = createOrderArray(orderBy as string, order as string)
  const highestRole = Math.max(...roles.map((role) => ROLE_HIERARCHY[role]))
  let result

  switch (highestRole) {
    case ROLE_HIERARCHY['Manager']:
      result = await userFormService.getUserFormsManager({
        managerId: requestedUserId,
        pagination: pagination,
        filter: {
          userFormStatus: userFormStatus as UserFormStatusType,
          userId: userId as string,
          formId: formId as string,
          userStatus: userStatus as UserFormStatusType,
          name: name as string
        },
        orderArray
      })
      break
    case ROLE_HIERARCHY['Employee']:
      result = await userFormService.getUserFormsEmployee({
        userId: requestedUserId,
        pagination: pagination,
        filter: {
          userFormStatus: userFormStatus as UserFormStatusType,
          formId: formId as string
        },
        orderArray
      })
      break
    default:
      result = await userFormService.getUserFormsHR({
        pagination: pagination,
        filter: {
          userFormStatus: userFormStatus as UserFormStatusType,
          userId: userId as string,
          formId: formId as string,
          userStatus: userStatus as UserFormStatusType,
          name: name as string
        },
        orderArray
      })
      break
  }

  return res.status(200).json({ message: 'Get user forms successfully', result })
}

/**
 * Controller for getting a user form by its ID.
 * @async
 * @param {Request} req - Express request object. The request should contain the user form ID in the parameters.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the user form data
 */
export const getUserFormByIdController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { roles } = req.decoded_authorization as TokenPayload
  const highestRole = Math.max(...roles.map((role) => ROLE_HIERARCHY[role]))
  const result = await userFormService.getUserFormWithDetails(userFormId)

  const renameResult = result?.toJSON()
  renameResult['userFormId'] = renameResult['id']
  delete renameResult['id']

  if (highestRole <= ROLE_HIERARCHY['Manager'] && renameResult.isDeleted) {
    return res.status(400).json({ message: 'User form is deleted', result: null })
  }

  return res.status(200).json({ message: 'Get user form details successfully', result: renameResult })
}

/**
 * Controller for submitting a user form.
 * @async
 * @param {Request} req - Express request object. The request should contain the user form ID in the parameters and the form data in the body.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the submitted form data
 */
export const submitUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  const { status } = (await userFormService.getOneUserForm(userFormId)) as UserForm
  if (status !== USER_FORMS_STATUS.NEW) {
    return res.status(400).json({ message: 'Form is already submitted', result: null })
  }

  await userFormService.submitUserFormDetail({ userFormId, answers: req.body, userId })
  return res.status(201).json({ message: 'Submit form successfully', result: null })
}

/**
 * Controller for updating a user form.
 * @async
 * @param {Request} req - Express request object. The request should contain the user form ID in the parameters and the updated form data in the body.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the updated form data
 */
export const updateUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload
  const userForm = (await userFormService.getOneUserForm(userFormId)) as UserForm

  if (
    userForm.status === USER_FORMS_STATUS.CLOSED ||
    userForm.status === USER_FORMS_STATUS.APPROVED ||
    userForm.status === USER_FORMS_STATUS.NEW
  ) {
    return res.status(400).json({ message: 'User form is closed or approved or new', result: null })
  }

  await userFormService.updateUserFormDetail(userFormId, req.body, userId)

  return res.status(200).json({ message: 'Update form successfully', result: null })
}

/**
 * Controller for approving a user form.
 * @async
 * @param {Request} req - Express request object. The request should contain the user form ID in the parameters and the approval data in the body.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the approved form data
 */
export const approveUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  await userFormService.approveAndEvaluateUserFormDetail(userFormId, userId, req.body)

  return res.status(200).json({ message: 'Approve form successfully', result: null })
}

/**
 * Controller for rejecting a user form.
 * @async
 * @param {Request} req - Express request object. The request should contain the user form ID in the parameters and the user ID in the decoded authorization.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the message 'Reject form successfully'
 */
export const rejectUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload
  // console.log(req.body)
  await userFormService.rejectAndEvaluateUserForm(userFormId, userId, req.body)

  return res.status(200).json({ message: 'Reject form successfully', result: null })
}

/**
 * Controller for closing a user form.
 * @async
 * @param {Request} req - Express request object. The request should contain the user form ID in the parameters and the user ID in the decoded authorization.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the message 'Close form successfully'
 */
export const closeUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  await userFormService.closeUserForm(userFormId, userId)

  return res.status(200).json({ message: 'Close form successfully', result: null })
}

/**
 * Controller for deleting a user form.
 *
 * @param {Request} req - The request object, containing the user form ID in the parameters and the user ID in the decoded authorization.
 * @param {Response} res - The response object.
 *
 * @returns {Promise<Response>} The response object.
 *
 * @throws {400} If the form is already deleted.
 * @throws {500} If there is an error in the service layer.
 */
export const deleteUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params
  const { user_id: userId } = req.decoded_authorization as TokenPayload

  const { isDeleted } = (await userFormService.getOneUserForm(userFormId)) as UserForm
  // console.log(isDeleted)
  if (isDeleted) {
    return res.status(400).json({ message: 'Form is already deleted', result: null })
  }

  await userFormService.deleteUserForm(userFormId, userId)

  return res.status(200).json({ message: 'Delete form successfully', result: null })
}

/**
 * Controller for undeleting a user form.
 *
 * @param {Request} req - The request object, containing the user form ID in the parameters.
 * @param {Response} res - The response object.
 *
 * @returns {Promise<Response>} The response object.
 *
 * @throws {400} If the form is already undeleted.
 * @throws {500} If there is an error in the service layer.
 */
export const undeleteUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { userFormId } = req.params

  const { isDeleted } = (await userFormService.getOneUserForm(userFormId)) as UserForm
  // console.log(isDeleted)

  if (!isDeleted) {
    return res.status(400).json({ message: 'Form is already undeleted', result: null })
  }

  await userFormService.undeleteUserForm(userFormId)

  return res.status(200).json({ message: 'Undelete form successfully', result: null })
}

export const assignUserFormController = async (req: Request, res: Response): Promise<Response> => {
  const { user_id: userId } = req.decoded_authorization as TokenPayload
  await userFormService.assignUserForms(req.body, userId)
  return res.status(201).json({ message: 'Assign forms with users successfully', result: null })
}
