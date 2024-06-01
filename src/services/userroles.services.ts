import UserRole from '../models/UserRole.model'
import { v4 as uuiv4 } from 'uuid'

class UserRoleService {
  async createMultipleUserRole(userRoles: { userId: string; roleIds: string[] }[]) {
    // có thể cải thiện sau để dùng bulkCreate
    const promises = userRoles.flatMap((userRole) => {
      const { roleIds, userId } = userRole
      return roleIds.map(async (roleId) => {
        const [userRole, created] = await UserRole.findOrCreate({
          where: { userId, roleId },
          defaults: { id: uuiv4(), userId, roleId, isDeleted: false }
        })

        if (!created && userRole.dataValues.isDeleted) {
          await userRole.update({ isDeleted: false })
        }

        return userRole
      })
    })

    await Promise.all(promises)
  }

  async deleteUserRole(userRoleId: string) {
    return UserRole.update({ isDeleted: true }, { where: { id: userRoleId } })
  }

  async undeleteUserRole(userRoleId: string) {
    return UserRole.update({ isDeleted: false }, { where: { id: userRoleId } })
  }

  async getUserRoleById(userRoleId: string) {
    return UserRole.findByPk(userRoleId, { raw: true })
  }
}

const userRoleService = new UserRoleService()

export default userRoleService
