import { Model, DataTypes, Sequelize } from 'sequelize'
import databaseService from '../services/database.services'

class FormDetail extends Model {
  id!: string
  content!: string
  isDeleted!: boolean
  createdAt?: Date
  deletedAt?: Date
  updatedAt?: Date
  formId!: string
  index!: number
}

/**
 * @swagger
 * components:
 *   schemas:
 *     FormDetail:
 *       type: object
 *       required:
 *         - id
 *         - content
 *         - isDeleted
 *         - formId
 *         - index
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the FormDetail
 *         content:
 *           type: string
 *           description: The content of the FormDetail
 *         isDeleted:
 *           type: boolean
 *           description: Whether the FormDetail is deleted
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation time of the FormDetail
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The deletion time of the FormDetail
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The update time of the FormDetail
 *         formId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated form
 *         index:
 *           type: integer
 *           description: The index of the FormDetail
 */
FormDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    formId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'FormDetail',
    tableName: 'form_details',
    timestamps: false,
    underscored: true
  }
)

export default FormDetail
