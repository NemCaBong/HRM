import { PaginationOptions } from '../constants/types'

export const getPagination = ({ limit = 10, page = 1 }: PaginationOptions) => {
  const pageSize = isNaN(limit) ? 10 : limit
  const offset = (isNaN(Number(page)) ? 0 : Number(page) - 1) * pageSize

  return {
    limit: pageSize,
    offset
  }
}
