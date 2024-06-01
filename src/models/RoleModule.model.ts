import { Model, UUIDV4, DataTypes } from 'sequelize'
import databaseService from '../services/database.services'

class RoleModule extends Model {
  id!: string
  api!: string
  roleId!: string
  isCanRead!: boolean
  isCanAdd!: boolean
  isCanEdit!: boolean
  isCanDelete!: boolean
  isCanApprove!: boolean
  isDeleted!: boolean
  updatedAt?: Date
  updatedBy?: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RoleModule:
 *       type: object
 *       required:
 *         - id
 *         - api
 *         - roleId
 *         - isCanRead
 *         - isCanAdd
 *         - isCanEdit
 *         - isCanDelete
 *         - isCanApprove
 *         - isDeleted
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the RoleModule
 *         api:
 *           type: string
 *           description: The API that a role can access
 *         roleId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated role
 *         isCanRead:
 *           type: boolean
 *           description: Whether the role can read
 *         isCanAdd:
 *           type: boolean
 *           description: Whether the role can add
 *         isCanEdit:
 *           type: boolean
 *           description: Whether the role can edit
 *         isCanDelete:
 *           type: boolean
 *           description: Whether the role can delete
 *         isCanApprove:
 *           type: boolean
 *           description: Whether the role can approve
 *         isDeleted:
 *           type: boolean
 *           description: Whether the RoleModule is deleted
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the RoleModule was last updated
 *         updatedBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who last updated the RoleModule
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the RoleModule was deleted
 */
RoleModule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    api: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    isCanRead: DataTypes.BOOLEAN,
    isCanAdd: DataTypes.BOOLEAN,
    isCanEdit: DataTypes.BOOLEAN,
    isCanDelete: DataTypes.BOOLEAN,
    isCanApprove: DataTypes.BOOLEAN,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    updatedAt: DataTypes.DATE,
    updatedBy: DataTypes.UUID,
    deleted_at: DataTypes.DATE
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'RoleModule',
    tableName: 'role_modules',
    timestamps: false,
    underscored: true
  }
)

export default RoleModule
