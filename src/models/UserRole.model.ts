import { Model, UUIDV4, DataTypes } from 'sequelize'
import databaseService from '../services/database.services'

class UserRole extends Model {
  id!: string
  userId!: string
  roleId!: string
  isDeleted!: boolean
  deletedAt?: Date
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - roleId
 *         - isDeleted
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the UserRole
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated user
 *         roleId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated role
 *         isDeleted:
 *           type: boolean
 *           description: Whether the UserRole is deleted
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the UserRole was deleted
 */
UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deletedAt: DataTypes.DATE
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'UserRole',
    tableName: 'user_roles',
    timestamps: false,
    underscored: true
  }
)

export default UserRole
