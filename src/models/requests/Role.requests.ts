export type RoleModulesReqBody = {
  api: string
  isCanRead: boolean
  isCanAdd: boolean
  isCanEdit: boolean
  isCanDelete: boolean
  isCanApprove: boolean
}[]
