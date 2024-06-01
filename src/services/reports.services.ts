import { FindOptions } from 'sequelize'
import { OrderArray } from '../constants/order'
import { PaginationResult } from '../constants/types'
import Form from '../models/Form.model'
import User from '../models/User.model'
import UserForm from '../models/UserForm.model'

class ReportService {
  async reportFormById({
    formId,
    userStatus = 'ALL',
    userFormStatus = 'ALL',
    pagination,
    orderArray
  }: {
    formId: string
    userStatus: string
    userFormStatus: string
    pagination: PaginationResult
    orderArray: OrderArray
  }) {
    const userFormQueryOptions: FindOptions = {
      where: {
        formId,
        ...(userFormStatus !== 'ALL' ? { status: userFormStatus } : {})
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'status', 'employeeId'],
          where: {
            ...(userStatus !== 'ALL' ? { status: userStatus } : {})
          }
        }
      ],
      order: orderArray,
      limit: pagination.limit,
      offset: pagination.offset,
      attributes: ['id', 'status', 'createdAt', 'updatedAt', 'deletedAt', 'filledAt', 'isDeleted']
    }

    const [form, userForms] = await Promise.all([
      Form.findByPk(formId, { attributes: ['id', 'name', 'description', 'total', 'isDeleted'] }),
      UserForm.findAll(userFormQueryOptions)
    ])

    return { form, userForms }
  }
}

const reportService = new ReportService()

export default reportService
