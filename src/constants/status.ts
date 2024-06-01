export type UserFormStatusType = 'NEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CLOSED'

export type UserStatusType = 'INTERN' | 'PROBATION' | 'OFFICIAL'

export const USER_STATUS_VALUES = ['INTERN', 'PROBATION', 'OFFICIAL']

export const USER_FORMS_STATUS = {
  NEW: 'NEW',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED'
}

export const USER_FORMS_STATUS_VALUES = ['NEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED']

export const USERS_STATUS = {
  INTERN: 'INTERN',
  PROBATION: 'PROBATION',
  OFFICIAL: 'OFFICIAL'
}
