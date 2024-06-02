import { v4 as uuidv4 } from 'uuid'
import { USER_FORMS_STATUS, UserFormStatusType } from '../constants/status'
import Form from '../models/Form.model'
import FormDetail from '../models/FormDetail.model'
import User from '../models/User.model'
import UserForm from '../models/UserForm.model'
import UserFormDetail from '../models/UserFormDetail.model'
import { SubmitFormReqBody } from '../models/requests/Form.requests'
import { FindOptions, Sequelize, Transaction, WhereOptions, where } from 'sequelize'
import { OrderArray } from '../constants/order'
import { PaginationResult } from '../constants/types'
import NotFoundError from '../errors/NotFoundError'
import CustomDatabaseError from '../errors/DatabaseError'
import databaseService from './database.services'
import { Op } from 'sequelize'
import emailEmitter from '../events/EmailEmitter'
import { readFileSync } from 'fs'
import path from 'path'
import usersService from './users.services'
import { CustomError } from '../errors/CustomError'

class UserFormService {
  getOneUserForm(userFormId: string, attributes: string[] = []) {
    return UserForm.findOne({
      where: { id: userFormId },
      attributes: attributes.length ? attributes : undefined,
      raw: true
    })
  }

  getUserFormWithDetails(userFormId: string) {
    return UserForm.findOne({
      where: { id: userFormId },
      include: [
        {
          model: UserFormDetail,
          as: 'userFormDetails',
          attributes: ['id', 'answer', 'evaluation', 'formDetailsId'],
          where: { isDeleted: false },
          required: false
        },
        {
          model: Form,
          as: 'form',
          attributes: ['id', 'name', 'description', 'total'],
          include: [
            {
              model: FormDetail,
              as: 'formDetails',
              attributes: ['id', 'content', 'index'],
              where: { isDeleted: false }
            }
          ]
        }
      ],
      attributes: ['id', 'status', 'filledAt', 'filledBy', 'isDeleted']
    })
  }

  async submitUserFormDetail({
    userFormId,
    answers,
    userId
  }: {
    userFormId: string
    answers: SubmitFormReqBody
    userId: string
  }) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      // get all the keys from the answers object
      const keys = Object.keys(answers)
      const userFormDetailsData = keys.map((key) => {
        return {
          id: uuidv4(),
          userFormId,
          formDetailsId: key,
          answer: answers[key]
        }
      })
      const userFormDetailsPromise = UserFormDetail.bulkCreate(userFormDetailsData, { transaction })

      const time = new Date()
      // update user form status to pending_approval
      await Promise.all([
        userFormDetailsPromise,
        UserForm.update(
          { status: USER_FORMS_STATUS.PENDING_APPROVAL, updatedAt: time, filledAt: time, filledBy: userId },
          { where: { id: userFormId }, transaction }
        )
      ])
      await transaction.commit()

      const [user, manager] = await Promise.all([usersService.getUser(userId), this.getManager(userFormId)])

      emailEmitter.emit('sendMail', {
        to: 'nemcabong@gmail.com',
        subject: 'Notification: Form needs approval',
        text: 'You have a new form to approve',
        html: readFileSync(path.resolve(__dirname, '../templates/pending_approval_mail.template.html'), 'utf-8')
          .replace(`[Employee Full Name]`, `${(user as User).lastName} ${(user as User).firstName}`)
          .replace('[Approval Link]', `http://localhost:8080/user-forms/${userFormId}`)
          .replace('[Employee ID]', (user as User).employeeId)
          .replace(`[Manager's Name]`, `${(manager as User).lastName} ${(manager as User).firstName}`)
      })
    } catch (error: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({
        message: 'Error submitting user form details',
        context: {
          api: 'submitUserFormDetail',
          error: error.message
        }
      })
    }
  }

  async updateUserFormDetail(userFormId: string, answers: SubmitFormReqBody, userId: string) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      // get all the keys from the answers object
      const keys = Object.keys(answers)
      // create an array of promises to bulk update
      const promises = keys.map((key) => {
        return UserFormDetail.update(
          {
            answer: answers[key]
          },
          {
            where: {
              userFormId,
              formDetailsId: key
            },
            transaction
          }
        )
      })

      const result = await Promise.all([
        ...promises,
        UserForm.update(
          { updatedAt: new Date(), updatedBy: userId, status: USER_FORMS_STATUS.PENDING_APPROVAL },
          { where: { id: userFormId }, transaction }
        )
      ])

      await transaction.commit()
      return result
    } catch (err: any) {
      await transaction.rollback()

      throw new CustomDatabaseError({
        message: 'Error updating user form details',
        context: {
          api: 'updateUserFormDetail',
          userFormId
        }
      })
    }
  }

  async approveUserForm({
    userFormId,
    userId,
    transaction
  }: {
    userFormId: string
    userId: string
    transaction?: Transaction
  }) {
    return UserForm.update(
      { status: 'APPROVED', updatedBy: userId, updatedAt: new Date() },
      { where: { id: userFormId }, transaction }
    )
  }

  async approveAndEvaluateUserFormDetail(userFormId: string, userId: string, evaluations: SubmitFormReqBody) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      // add evaluations to each userformdetail and update the status of the userform
      const keys = Object.keys(evaluations)
      const promises = keys.map((key) => {
        return UserFormDetail.update(
          {
            evaluation: evaluations[key]
          },
          {
            where: {
              userFormId,
              formDetailsId: key
            },
            transaction
          }
        )
      })
      const result = await Promise.all([this.approveUserForm({ userFormId, transaction, userId }), ...promises])

      await transaction.commit()
      return result
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({
        message: 'Error approving and evaluating user form details',
        context: {
          api: 'approveAndEvaluateUserFormDetail',
          userFormId
        }
      })
    }
  }

  async getManager(userFormId: string) {
    const { userId } = (await UserForm.findByPk(userFormId, {
      attributes: ['userId'],
      raw: true
    })) as UserForm
    const { managerId } = (await User.findByPk(userId, { attributes: ['managerId'], raw: true })) as User

    if (!managerId) throw new NotFoundError({ message: 'User not have manager yet', context: { userFormId } })
    const manager = await User.findByPk(managerId, { raw: true })

    if (!manager) throw new NotFoundError({ message: 'Manager not found', context: { userFormId } })

    return manager
  }

  async isOwner(userFormId: string, userId: string) {
    const userForm = (await UserForm.findByPk(userFormId, { attributes: ['userId'], raw: true })) as UserForm
    if (!userForm) return false

    return userForm.userId === userId
  }

  async getUserFormsHR({
    pagination,
    filter,
    orderArray
  }: {
    pagination: PaginationResult
    filter: {
      name?: string
      userFormStatus?: UserFormStatusType
      userStatus?: string
      formId?: string
      userId?: string
    }
    orderArray: OrderArray
  }) {
    const whereUser: WhereOptions = {}
    const whereForm: WhereOptions = {}

    if (filter.formId) whereForm.id = filter.formId
    if (filter.userId) whereUser.id = filter.userId
    if (filter.userStatus) whereUser.status = filter.userStatus
    if (filter.name)
      (whereUser as any)[Op.and] = [
        Sequelize.where(Sequelize.literal(`CONCAT("user"."first_name", ' ', "user"."last_name")`), {
          [Op.iLike]: `%${filter.name}%`
        })
      ]

    const queryOptions: FindOptions = {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'status', 'avatar'],
          where: whereUser
        },
        {
          model: Form,
          as: 'form',
          attributes: ['id', 'name', 'description', 'total', 'isDeleted'],
          where: whereForm
        }
      ],
      attributes: ['id', 'status', 'isDeleted'],
      limit: pagination.limit,
      offset: pagination.offset,
      order: orderArray
    }

    if (filter.userFormStatus) queryOptions.where = { status: filter.userFormStatus }

    return await UserForm.findAll(queryOptions)
  }

  async getUserFormsManager({
    managerId,
    pagination,
    orderArray,
    filter
  }: {
    managerId: string
    pagination: PaginationResult
    orderArray: OrderArray
    filter: {
      name?: string
      userFormStatus?: UserFormStatusType
      userStatus?: string
      formId?: string
      userId?: string
    }
  }) {
    let whereUser: WhereOptions = {
      [Op.or]: [{ managerId: managerId }, { id: managerId }]
    }
    const whereForm: WhereOptions = { isDeleted: false }
    const whereUserForm: WhereOptions = { isDeleted: false }

    if (filter.name)
      whereUser = {
        ...whereUser,
        [Op.and]: [
          Sequelize.where(Sequelize.literal(`CONCAT("user"."first_name", ' ', "user"."last_name")`), {
            [Op.iLike]: `%${filter.name}%`
          })
        ]
      }

    if (filter.userFormStatus) whereUserForm.status = filter.userFormStatus
    if (filter.userStatus) (whereUser as any).status = filter.userStatus
    if (filter.formId) whereForm.id = filter.formId
    if (filter.userId) (whereUser as any).id = filter.userId

    const queryOptions: FindOptions = {
      where: whereUserForm,
      include: [
        {
          model: User,
          as: 'user',
          where: whereUser,
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'status', 'avatar']
        },
        {
          model: Form,
          as: 'form',
          where: whereForm,
          attributes: ['id', 'name', 'description', 'total']
        }
      ],
      attributes: ['id', 'status', 'isDeleted'],
      limit: pagination.limit,
      offset: pagination.offset,
      order: orderArray
    }

    return await UserForm.findAll(queryOptions)
  }

  async getUserFormsEmployee({
    userId,
    pagination,
    filter,
    orderArray
  }: {
    userId: string
    pagination: PaginationResult
    filter: { userFormStatus?: UserFormStatusType; formId?: string }
    orderArray: OrderArray
  }) {
    const whereUserForm: WhereOptions = { isDeleted: false }
    const whereForm: WhereOptions = { isDeleted: false }

    if (filter.userFormStatus) whereUserForm.status = filter.userFormStatus
    if (filter.formId) whereForm.id = filter.formId

    const queryOptions: FindOptions = {
      where: whereUserForm,
      include: [
        {
          model: User,
          as: 'user',
          where: {
            id: userId
          },
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'status', 'avatar']
        },
        {
          model: Form,
          as: 'form',
          where: whereForm,
          attributes: ['id', 'name', 'description', 'total']
        }
      ],
      attributes: ['id', 'status', 'isDeleted'],
      limit: pagination.limit,
      offset: pagination.offset,
      order: orderArray
    }

    return await UserForm.findAll(queryOptions)
  }

  async rejectUserForm({
    userFormId,
    userId,
    transaction
  }: {
    userFormId: string
    userId: string
    transaction?: Transaction
  }) {
    return UserForm.update(
      { status: 'REJECTED', updatedBy: userId, updatedAt: new Date() },
      { where: { id: userFormId }, transaction }
    )
  }

  async rejectAndEvaluateUserForm(userFormId: string, userId: string, evaluations: SubmitFormReqBody) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      // add evaluations to each userformdetail and update the status of the userform
      const keys = Object.keys(evaluations)
      const promises = keys.map((key) => {
        return UserFormDetail.update(
          {
            evaluation: evaluations[key]
          },
          {
            where: {
              userFormId,
              formDetailsId: key
            },
            transaction
          }
        )
      })
      const result = await Promise.all([this.rejectUserForm({ userFormId, transaction, userId }), ...promises])
      const user = await usersService.getUserByUserFormId(userFormId)

      await transaction.commit()
      emailEmitter.emit('sendMail', {
        to: 'nemcabong@gmail.com',
        subject: 'Notification: Form needs updated to be approved',
        text: 'You have a new form to be updated to be approved',
        html: readFileSync(path.resolve(__dirname, '../templates/reject_mail.template.html'), 'utf-8')
          .replace(`[Employee's Name]`, `${(user as User).lastName} ${(user as User).firstName}`)
          .replace('[Rejection Link]', `http://localhost:8080/user-forms/${userFormId}`)
          .replace(`[Form's ID]`, userFormId)
      })
      return result
    } catch (err: any) {
      await transaction.rollback()
      if (err instanceof CustomError) throw err
      throw new CustomDatabaseError({
        message: 'Error rejecting and evaluating user form details',
        context: {
          api: 'approveAndEvaluateUserFormDetail',
          userFormId
        }
      })
    }
  }

  async ifUserFormApproved(userFormId: string) {
    const userForm = (await UserForm.findByPk(userFormId, { attributes: ['status'], raw: true })) as UserForm

    if (!userForm)
      throw new NotFoundError({
        message: 'User form not found',
        context: { userFormId }
      })

    return userForm.status === USER_FORMS_STATUS.APPROVED
  }

  async closeUserForm(userFormId: string, userId: string) {
    return UserForm.update(
      { status: USER_FORMS_STATUS.CLOSED, updatedAt: new Date(), updatedBy: userId },
      { where: { id: userFormId } }
    )
  }

  async ifUserFormPendingApproval(userFormId: string) {
    const userForm = (await UserForm.findByPk(userFormId, { attributes: ['status'], raw: true })) as UserForm

    if (!userForm)
      throw new NotFoundError({
        message: 'User form not found',
        context: { userFormId }
      })

    return userForm.status === USER_FORMS_STATUS.PENDING_APPROVAL
  }

  async deleteUserForm(userFormId: string, userId: string) {
    return UserForm.update({ isDeleted: true, deletedAt: new Date(), deletedBy: userId }, { where: { id: userFormId } })
  }

  async undeleteUserForm(userFormId: string) {
    return UserForm.update({ isDeleted: false, deletedAt: null, deletedBy: null }, { where: { id: userFormId } })
  }

  async assignUserForms(usersWithFormsInfo: { userId: string; formIds: string[] }[], userId: string) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      const time = new Date()
      const userFormIdList: string[] = []
      const promises = usersWithFormsInfo.map((userWithFormInfo) => {
        const userFormIds = userWithFormInfo.formIds.map((formId) => {
          const uuid = uuidv4()
          userFormIdList.push(uuid)
          return {
            id: uuid,
            userId: userWithFormInfo.userId,
            formId,
            createdBy: userId,
            createdAt: time,
            status: USER_FORMS_STATUS.NEW,
            isDeleted: false
          }
        })
        return UserForm.bulkCreate(userFormIds, { transaction })
      })

      await Promise.all(promises)
      await transaction.commit()
      let count = 0
      usersWithFormsInfo.forEach(async (userWithFormInfo) => {
        const listFormIds = userWithFormInfo.formIds
        const user = (await usersService.getUser(userWithFormInfo.userId)) as User

        listFormIds.forEach(() => {
          emailEmitter.emit('sendMail', {
            to: 'nemcabong@gmail.com',
            subject: 'Notification: New Form',
            text: 'You have a new form to fill in',
            html: readFileSync(path.resolve(__dirname, '../templates/new_form_mail.template.html'), 'utf-8')
              .replace(`[Recipient's Name]`, `${user.lastName} ${user.firstName}`)
              .replace('[Form Link]', `http://localhost:8080/user-forms/${userFormIdList[count]}`)
          })
          count += 1
        })
      })
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({
        message: 'Error assigning user forms',
        context: { api: 'assignUserForm', error: err.message }
      })
    }
  }
}

const userFormService = new UserFormService()

export default userFormService
