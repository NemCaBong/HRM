import { OrderType } from '../constants/order'

export const createOrderArray = (orderBy: string = '', order: string = ''): [string, OrderType][] => {
  if (!orderBy) {
    return []
  }

  const fields = orderBy.split(',')
  const directions = order ? order.split(',') : []

  return fields.map((field, index) => {
    const direction = directions[index]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    return [field, direction]
  })
}
