import combinePermissions from '../utils/combineRoles'
import { getPagination } from '../utils/pagination'
import { createOrderArray } from '../utils/order'

describe('getPagination', () => {
  it('should return default pagination when no parameters are provided', () => {
    const result = getPagination({})
    expect(result).toEqual({ limit: 10, offset: 0 })
  })

  it('should return correct pagination when limit and page are provided', () => {
    const result = getPagination({ limit: 20, page: 2 })
    expect(result).toEqual({ limit: 20, offset: 20 })
  })

  it('should return correct pagination when limit is NaN', () => {
    const result = getPagination({ limit: NaN, page: 2 })
    expect(result).toEqual({ limit: 10, offset: 10 })
  })

  it('should return correct pagination when page is NaN', () => {
    const result = getPagination({ limit: 20, page: NaN })
    expect(result).toEqual({ limit: 20, offset: 0 })
  })
})

describe('combinePermissions', () => {
  it('should correctly combine permissions', () => {
    const permissions = {
      role1: [
        { api: 'api1', isCanRead: true, isCanAdd: false, isCanEdit: false, isCanDelete: false, isCanApprove: false },
        { api: 'api2', isCanRead: false, isCanAdd: true, isCanEdit: false, isCanDelete: false, isCanApprove: false }
      ],
      role2: [
        { api: 'api1', isCanRead: false, isCanAdd: true, isCanEdit: true, isCanDelete: false, isCanApprove: false },
        { api: 'api2', isCanRead: true, isCanAdd: false, isCanEdit: true, isCanDelete: true, isCanApprove: true }
      ]
    }

    const result = combinePermissions(permissions)

    expect(result).toEqual([
      { api: 'api1', isCanRead: true, isCanAdd: true, isCanEdit: true, isCanDelete: false, isCanApprove: false },
      { api: 'api2', isCanRead: true, isCanAdd: true, isCanEdit: true, isCanDelete: true, isCanApprove: true }
    ])
  })
})

describe('createOrderArray', () => {
  it('should return an empty array when orderBy is empty', () => {
    const result = createOrderArray()
    expect(result).toEqual([])
  })

  it('should return an array of tuples with field and direction', () => {
    const result = createOrderArray('field1,field2', 'asc,desc')
    expect(result).toEqual([
      ['field1', 'ASC'],
      ['field2', 'DESC']
    ])
  })

  it('should default to ASC when order is not provided', () => {
    const result = createOrderArray('field1,field2', 'asc')
    expect(result).toEqual([
      ['field1', 'ASC'],
      ['field2', 'ASC']
    ])
  })

  it('should default to ASC when order is not recognized', () => {
    const result = createOrderArray('field1,field2', 'asc,random')
    expect(result).toEqual([
      ['field1', 'ASC'],
      ['field2', 'ASC']
    ])
  })
})
