import { Model, UUIDV4, DataTypes, Sequelize } from 'sequelize'
import databaseService from '../services/database.services'

class Role extends Model {
  id!: string
  name!: string
  description!: string
  isDeleted!: boolean
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - isDeleted
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the Role
 *         name:
 *           type: string
 *           description: The name of the Role
 *         description:
 *           type: string
 *           description: The description of the Role
 *         isDeleted:
 *           type: boolean
 *           description: Whether the Role is deleted
 */
Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false,
    underscored: true
  }
)

export default Role
