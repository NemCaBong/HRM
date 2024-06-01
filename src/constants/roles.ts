export const ROLE_HIERARCHY: { [key: string]: number } = {
  Employee: 1,
  Manager: 2,
  HR: 3,
  Director: 4,
  Admin: 5
}

export const ROLES = ['Employee', 'Manager', 'HR', 'Director', 'Admin'] as const

export const ROLES_NAME = {
  Employee: 'Employee',
  Manager: 'Manager',
  HR: 'HR',
  Director: 'Director',
  Admin: 'Admin'
}

export type RoleType = 'Employee' | 'Manager' | 'HR' | 'Director' | 'Admin'

export type RoleModule = {
  api: string
  isCanRead: boolean
  isCanAdd: boolean
  isCanEdit: boolean
  isCanDelete: boolean
  isCanApprove: boolean
}

export type ReturnedPermissions = { [key: string]: RoleModule[] }
