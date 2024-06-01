export type OrderType = 'ASC' | 'DESC'

export type UserFormOrderByType = 'createdAt' | 'updatedAt' | 'filledAt' | 'status'

export type FormOrderByType = 'createdAt' | 'updatedAt' | 'name' | 'total'

export type UserOrderByType =
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'employee_id'
  | 'address'

export const UserFormOrderByArray = ['createdAt', 'updatedAt', 'filledAt', 'status'] as const

export const FormOrderByArray = ['createdAt', 'updatedAt', 'name', 'total'] as const

export const UserOrderByArray = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'email',
  'first_name',
  'last_name',
  'employee_id',
  'address'
] as const

export const RoleOrderByArray = ['name', 'api', 'description'] as const

export type OrderArray = [string, OrderType][]
