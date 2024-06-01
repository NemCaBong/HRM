import { Request, Response } from 'express'
import roleService from '../services/roles.services'
import { createOrderArray } from '../utils/order'

export const getRolesController = async (req: Request, res: Response): Promise<Response> => {
  const { order = 'ASC', orderBy = 'api', roleName, isCanRead, isCanAdd, isCanEdit, isCanDelete } = req.query

  const orderArray = createOrderArray(orderBy as string, order as string)

  const result = await roleService.getRolesWithDetails({
    orderArray,
    roleName: roleName as string,
    isCanRead: isCanRead === undefined ? undefined : Boolean(isCanRead),
    isCanAdd: isCanAdd === undefined ? undefined : Boolean(isCanAdd),
    isCanEdit: isCanEdit === undefined ? undefined : Boolean(isCanEdit),
    isCanDelete: isCanDelete === undefined ? undefined : Boolean(isCanDelete)
  })

  return res.status(200).json({ messsage: 'Get roles successfully', result: result })
}

export const getRoleController = async (req: Request, res: Response): Promise<Response> => {
  const { roleId } = req.params

  const result = await roleService.getRoleWithDetails(roleId)

  return res.status(200).json({ messsage: 'Get role successfully', result: result })
}

export const addNewRoleModulesController = async (req: Request, res: Response): Promise<Response> => {
  const { roleId } = req.params

  await roleService.addNewRoleModules(roleId, req.body)

  return res.status(200).json({ messsage: 'Add new role modules successfully', result: null })
}

export const updateRoleModulesController = async (req: Request, res: Response): Promise<Response> => {
  const { roleId } = req.params
  await roleService.updateRoleModules(roleId, req.body)

  return res.status(200).json({ messsage: 'Update role modules successfully', result: null })
}
