export interface Permission {
  api: string
  isCanRead: boolean
  isCanAdd: boolean
  isCanEdit: boolean
  isCanDelete: boolean
  isCanApprove: boolean
}

export type AccessRight = 'isCanRead' | 'isCanAdd' | 'isCanEdit' | 'isCanDelete' | 'isCanApprove'
