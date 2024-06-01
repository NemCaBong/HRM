import { Permission } from '../constants/permission'
import { ReturnedPermissions } from '../constants/roles'

function combinePermissions(permissions: ReturnedPermissions): Permission[] {
  const combinedPermissions: { [api: string]: Permission } = {}
  const roles = Object.keys(permissions)

  roles.forEach((role) => {
    if (permissions[role]) {
      permissions[role].forEach((permission) => {
        if (!combinedPermissions[permission.api]) {
          combinedPermissions[permission.api] = { ...permission }
        } else {
          combinedPermissions[permission.api].isCanRead ||= permission.isCanRead
          combinedPermissions[permission.api].isCanAdd ||= permission.isCanAdd
          combinedPermissions[permission.api].isCanEdit ||= permission.isCanEdit
          combinedPermissions[permission.api].isCanDelete ||= permission.isCanDelete
          combinedPermissions[permission.api].isCanApprove ||= permission.isCanApprove
        }
      })
    }
  })

  return Object.values(combinedPermissions)
}

export default combinePermissions
