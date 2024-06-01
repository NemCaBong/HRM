import { Model, DataTypes, UUIDV4, Sequelize } from 'sequelize'
import databaseService from '../services/database.services'

class Form extends Model {
  // form_details?: FormDetail[]
  id!: string
  name!: string
  description?: string
  createdAt!: Date
  updatedAt!: Date
  total!: number
  deletedAt?: Date
  isDeleted!: boolean
  createdBy!: string
  updatedBy?: string
  deletedBy?: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Form:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - isDeleted
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the Form
 *         name:
 *           type: string
 *           description: The name of the Form
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation time of the Form
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The update time of the Form
 *         total:
 *           type: integer
 *           description: The total number of associated form details
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The deletion time of the Form
 *         isDeleted:
 *           type: boolean
 *           description: Whether the Form is deleted
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who created the Form
 *         updatedBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who last updated the Form
 *         deletedBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who deleted the Form
 */
Form.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    name: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    total: {
      type: DataTypes.INTEGER
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'Form',
    tableName: 'forms',
    timestamps: false,
    underscored: true
  }
)

export default Form
