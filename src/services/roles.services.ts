import CustomDatabaseError from '../errors/DatabaseError'
import { RoleModulesReqBody } from '../models/requests/Role.requests'
import databaseService from './database.services'
import { v4 as uuidv4 } from 'uuid'
import RoleModule from '../models/RoleModule.model'
import Role from '../models/Role.model'
import { OrderArray } from '../constants/order'
import { FindOptions } from 'sequelize'

class RoleService {
  async getRole(roleId: string) {
    return Role.findByPk(roleId, {
      raw: true
    })
  }

  async getRolesWithDetails({
    orderArray,
    roleName,
    isCanRead,
    isCanAdd,
    isCanEdit,
    isCanDelete
  }: {
    orderArray: OrderArray
    roleName?: string
    isCanRead?: boolean
    isCanAdd?: boolean
    isCanEdit?: boolean
    isCanDelete?: boolean
  }) {
    if (!roleName) {
      roleName = 'ALL'
    }

    const findOptions: FindOptions = {
      include: [
        {
          model: RoleModule,
          as: 'roleModules',
          where: { isDeleted: false },
          required: false,
          attributes: ['id', 'api', 'isCanRead', 'isCanAdd', 'isCanEdit', 'isCanDelete', 'isCanApprove']
        }
      ]
    }

    if (orderArray[0][0] === 'api') {
      findOptions.order = [[{ model: RoleModule, as: 'roleModules' }, 'api', orderArray[0][1]]]
    } else {
      findOptions.order = orderArray
    }

    if (roleName !== 'ALL') {
      findOptions.where = {
        name: roleName
      }
    }

    if (isCanRead !== undefined) {
      ;(findOptions as any).include[0].where.isCanRead = isCanRead
    }

    if (isCanAdd !== undefined) {
      ;(findOptions as any).include[0].where.isCanAdd = isCanAdd
    }

    if (isCanEdit !== undefined) {
      ;(findOptions as any).include[0].where.isCanEdit = isCanEdit
    }

    if (isCanDelete !== undefined) {
      ;(findOptions as any).include[0].where.isCanDelete = isCanDelete
    }

    return await Role.findAll(findOptions)
  }

  async getRoleWithDetails(roleId: string) {
    return Role.findOne({
      where: {
        id: roleId
      },
      include: [
        {
          model: RoleModule,
          as: 'roleModules',
          where: { isDeleted: false },
          required: false,
          attributes: {
            exclude: ['roleId']
          }
        }
      ]
    })
  }

  async addNewRoleModules(roleId: string, roleModules: RoleModulesReqBody) {
    const transaction = await databaseService.getSequelize().transaction()
    try {
      const roleModulesData = roleModules.map((roleModule) => {
        const { api, isCanRead, isCanAdd, isCanEdit, isCanDelete, isCanApprove } = roleModule
        return {
          id: uuidv4(),
          roleId,
          api,
          isCanRead,
          isCanAdd,
          isCanEdit,
          isCanDelete,
          isCanApprove
        }
      })
      await RoleModule.bulkCreate(roleModulesData, { transaction })
      await transaction.commit()
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({
        message: 'Error adding new permissions to that role',
        context: { api: 'addNewRoleModules', error: err.message }
      })
    }
  }

  async getRoleModulesByRoleId(roleId: string, attributes: string[] = []) {
    return RoleModule.findAll({
      where: {
        roleId
      },
      attributes: attributes.length ? attributes : undefined,
      raw: true
    })
  }

  async updateRoleModules(roleId: string, roleModules: RoleModulesReqBody) {
    const transaction = await databaseService.getSequelize().transaction()

    try {
      const promises = roleModules.map((roleModule) => {
        const { api, isCanRead, isCanAdd, isCanEdit, isCanDelete, isCanApprove } = roleModule

        return RoleModule.update(
          {
            isCanRead,
            isCanAdd,
            isCanEdit,
            isCanDelete,
            isCanApprove
          },
          {
            where: {
              roleId,
              api
            },
            transaction
          }
        )
      })
      await Promise.all(promises)
      await transaction.commit()
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({
        message: 'Error updating permissions of that role',
        context: { api: 'updateRoleModules', errors: err.message }
      })
    }
  }
}
const roleService = new RoleService()

export default roleService
