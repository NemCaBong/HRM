import { Request, Response } from 'express'
import reportService from '../services/reports.services'
import { createOrderArray } from '../utils/order'
import { getPagination } from '../utils/pagination'

/**
 * Controller for generating a report for a form by its ID.
 * @async
 * @param {Request} req - Express request object. The request should contain the form ID in the parameters, and may also contain page, limit, order, orderBy, userStatus, and userFormStatus in the query.
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns a response with the report data
 */
export const reportFormByIdController = async (req: Request, res: Response): Promise<Response> => {
  const { formId } = req.params
  const { page, limit, order, orderBy, userStatus, userFormStatus } = req.query

  const pagination = getPagination({ page: Number(page), limit: Number(limit) })
  const orderArray = createOrderArray(orderBy as string, order as string)

  const result = await reportService.reportFormById({
    formId,
    userStatus: userStatus as string,
    userFormStatus: userFormStatus as string,
    orderArray,
    pagination
  })

  return res.status(200).json({ message: 'Report retrieved successfully', result })
}
