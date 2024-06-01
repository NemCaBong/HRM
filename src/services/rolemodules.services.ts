import RoleModule from '../models/RoleModule.model'

class RoleModuleService {
  async getRoleModule(roleModuleId: string) {
    return RoleModule.findOne({ where: { id: roleModuleId }, raw: true })
  }

  async deleteRoleModule(roleModuleId: string) {
    return RoleModule.update({ isDeleted: true }, { where: { id: roleModuleId } })
  }

  async undeleteRoleModule(roleModuleId: string) {
    return RoleModule.update({ isDeleted: false }, { where: { id: roleModuleId } })
  }
}

const roleModuleService = new RoleModuleService()

export default roleModuleService
