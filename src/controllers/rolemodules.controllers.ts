import { Request, Response } from 'express'
import roleModuleService from '../services/rolemodules.services'
import RoleModule from '../models/RoleModule.model'

export const deleteRoleModuleController = async (req: Request, res: Response) => {
  const { roleModuleId } = req.params
  const roleModule = (await roleModuleService.getRoleModule(roleModuleId)) as RoleModule

  if (roleModule.isDeleted) return res.status(400).json({ message: 'Role module already deleted', result: null })

  await roleModuleService.deleteRoleModule(roleModuleId)

  res.status(200).json({ message: 'Role module deleted successfully', result: null })
}

export const undeleteRoleModuleController = async (req: Request, res: Response) => {
  const { roleModuleId } = req.params
  const roleModule = (await roleModuleService.getRoleModule(roleModuleId)) as RoleModule

  if (!roleModule.isDeleted) return res.status(400).json({ message: 'Role module already undeleted', result: null })

  await roleModuleService.undeleteRoleModule(roleModuleId)

  res.status(200).json({ message: 'Role module undeleted successfully', result: null })
}
