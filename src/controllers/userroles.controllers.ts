import { Request, Response } from 'express'
import userRoleService from '../services/userroles.services'

export const createMultipleUserRoleController = async (req: Request, res: Response) => {
  await userRoleService.createMultipleUserRole(req.body)

  return res.status(201).json({ message: 'User roles successfully created', result: null })
}

export const deleteUserRoleController = async (req: Request, res: Response) => {
  const { userRoleId } = req.params
  await userRoleService.deleteUserRole(userRoleId)

  return res.status(200).json({ message: 'User role successfully deleted', result: null })
}

export const undeleteUserRoleController = async (req: Request, res: Response) => {
  const { userRoleId } = req.params
  await userRoleService.undeleteUserRole(userRoleId)

  return res.status(200).json({ message: 'User role successfully undeleted', result: null })
}
