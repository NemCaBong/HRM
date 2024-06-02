import { v4 as uuidv4 } from 'uuid'
import Form from '../models/Form.model'
import FormDetail from '../models/FormDetail.model'
import _ from 'lodash'
import { AddNewFormReqBody, FormDetailReqBody, UpdateFormReqBody } from '../models/requests/Form.requests'
import { PaginationResult } from '../constants/types'
import { FormOrderByType, OrderType } from '../constants/order'
import UserForm from '../models/UserForm.model'
import { USER_FORMS_STATUS } from '../constants/status'
import databaseService from './database.services'
import CustomDatabaseError from '../errors/DatabaseError'
import { FindOptions, Op } from 'sequelize'
import User from '../models/User.model'
import { readFileSync } from 'fs'
import path from 'path'
import emailEmitter from '../events/EmailEmitter'
import UserFormDetail from '../models/UserFormDetail.model'

class FormService {
  getFormById(formId: string, attributes: string[] = []) {
    return Form.findOne({
      where: { id: formId },
      attributes: attributes.length ? attributes : undefined,
      include: [
        {
          model: FormDetail,
          as: 'formDetails',
          where: { isDeleted: false }
        }
      ],
      raw: true
    })
  }

  getFormWithDetails(formId: string, attributes: string[] = []) {
    return Form.findOne({
      where: { id: formId },
      attributes: attributes.length ? attributes : undefined,
      include: [
        {
          model: FormDetail,
          as: 'formDetails',
          where: { isDeleted: false }
        }
      ]
    })
  }

  async addNewForm(userId: string, form: AddNewFormReqBody) {
    const transaction = await databaseService.getSequelize().transaction()

    try {
      // create a new form
      const formId = uuidv4()
      const formDetails = form.form_details
      const users = form.users
      const time = new Date()

      await Form.create(
        {
          id: formId,
          name: form.name,
          description: form.description,
          total: form.total,
          isDeleted: false,
          createdAt: time,
          createdBy: userId
        },
        { transaction }
      )

      const formDetailsData = formDetails.map((formDetail: FormDetailReqBody) => {
        return {
          id: formDetail.id,
          content: formDetail.content,
          index: formDetail.index,
          formId: formId,
          isDeleted: false,
          createdAt: time
        }
      })
      const formDetailPromise = FormDetail.bulkCreate(formDetailsData, { transaction })

      const listUserFormIds = users.map(() => uuidv4())
      const userFormsData = users.map((userId, index) => {
        return {
          id: listUserFormIds[index],
          userId: userId,
          formId: formId,
          isDeleted: false,
          createdAt: time,
          status: USER_FORMS_STATUS.NEW,
          createdBy: userId
        }
      })
      const userFormsPromise = UserForm.bulkCreate(userFormsData, { transaction })

      await Promise.all([userFormsPromise, formDetailPromise])
      // get all email from users
      const usersInfo = await User.findAll({
        where: {
          id: {
            [Op.in]: users
          }
        },
        raw: true,
        attributes: ['email', 'firstName', 'lastName'],
        transaction
      })

      usersInfo.forEach((user, index) => {
        emailEmitter.emit('sendMail', {
          to: 'nemcabong@gmail.com',
          subject: 'Notification: New Form',
          text: 'You have a new form to fill in',
          html: readFileSync(path.resolve(__dirname, '../templates/new_form_mail.template.html'), 'utf-8')
            .replace(`[Recipient's Name]`, `${user.lastName} ${user.firstName}`)
            .replace('[Form Link]', `http://localhost:8080/user-forms/${listUserFormIds[index]}`)
        })
      })

      await transaction.commit()
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({
        message: 'Database Error: ' + err.message,
        context: {
          api: 'addNewForm'
        }
      })
    }
  }

  async getForms({
    order = 'ASC',
    orderBy = 'createdAt',
    pagination,
    filter
  }: {
    order: OrderType
    orderBy: FormOrderByType
    pagination: PaginationResult
    filter: { name: string }
  }) {
    const findOptions: FindOptions = {
      include: [
        {
          model: FormDetail,
          as: 'formDetails',
          where: { isDeleted: false },
          attributes: ['id', 'content', 'index']
        }
      ],
      order: [[orderBy, order]],
      attributes: ['id', 'name', 'description', 'total', 'createdAt', 'createdBy'],
      limit: pagination.limit,
      offset: pagination.offset
    }

    if (filter.name) {
      findOptions.where = {
        ...findOptions.where,
        name: {
          [Op.iLike]: `%${filter.name}%`
        }
      }
    }

    return Form.findAll(findOptions)
  }

  async deleteFormAndUserFormByFormId(formId: string, userId: string) {
    const time = new Date()

    return Promise.all([
      Form.update({ isDeleted: true, deletedAt: time, deletedBy: userId }, { where: { id: formId } }),

      UserForm.update({ isDeleted: true, deletedAt: time, deletedBy: userId }, { where: { formId: formId } })
    ])
  }

  async updateForm({
    formId,
    updatedData,
    userId
  }: {
    formId: string
    updatedData: UpdateFormReqBody
    userId: string
  }) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      const formDetails = updatedData.form_details
      // get all form details
      const formDetailsIdDb = await FormDetail.findAll({
        where: {
          formId: formId
        },
        attributes: ['id'],
        raw: true,
        transaction
      })

      const formDetailsIdListFromDb = _.map(formDetailsIdDb, 'id')

      const time = new Date()
      const promises = formDetails.map((formDetail) => {
        if (formDetailsIdListFromDb.includes(formDetail.id)) {
          return FormDetail.update(
            { content: formDetail.content, index: formDetail.index, updatedAt: time },
            {
              where: {
                id: formDetail.id
              },
              transaction
            }
          )
        } else {
          return FormDetail.create(
            {
              id: formDetail.id,
              content: formDetail.content,
              index: formDetail.index,
              formId,
              isDeleted: false,
              createdAt: time
            },
            { transaction }
          )
        }
      })

      const idsToDelete = _.difference(
        formDetailsIdListFromDb,
        formDetails.map((formDetail) => formDetail.id)
      )
      // delete all form details that are not in the updated form details
      // and also delete all user form details that are associated with the form details
      idsToDelete.forEach((id) => {
        promises.push(FormDetail.update({ isDeleted: true, deletedAt: time }, { where: { id }, transaction }))
        promises.push(
          UserFormDetail.update({ isDeleted: true, deletedAt: time }, { where: { formDetailsId: id }, transaction })
        )
      })
      // update form
      const formPromise = Form.update(
        {
          updatedAt: time,
          name: updatedData.name,
          total: updatedData.total,
          updatedBy: userId,
          description: updatedData.description
        },
        { where: { id: formId }, transaction }
      )
      await Promise.all([...promises, formPromise])

      await transaction.commit()
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({ message: err.message, context: { api: 'updateForm' } })
    }
  }

  async undeleteForm(formId: string) {
    return Form.update({ isDeleted: false, deletedAt: null, deletedBy: null }, { where: { id: formId } })
  }
}

const formService = new FormService()

export default formService
