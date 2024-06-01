import { Model, DataTypes } from 'sequelize'
import { UserFormStatus } from '../constants/enums'
import databaseService from '../services/database.services'

class UserForm extends Model {
  id!: string
  userId!: string
  formId!: string
  createdAt?: Date
  createdBy?: string
  status!: string
  updatedAt?: Date
  isDeleted!: boolean
  deletedAt?: Date
  deletedBy?: string
  filledAt?: Date
  updatedBy?: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserForm:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - formId
 *         - status
 *         - isDeleted
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the UserForm
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated user
 *         formId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated form
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the UserForm was created
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who created the UserForm
 *         status:
 *           type: string
 *           enum: [NEW, PENDING_APPROVAL, APPROVED, REJECTED, CLOSED]
 *           description: The status of the UserForm
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the UserForm was last updated
 *         isDeleted:
 *           type: boolean
 *           description: Whether the UserForm is deleted
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the UserForm was deleted
 *         deletedBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who deleted the UserForm
 *         filledAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the UserForm was filled
 *         filledBy:
 *           type: string
 *           format: uuid
 *           description: The person filled the UserForm
 *         updatedBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who last updated the UserForm
 */
UserForm.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    formId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID
    },
    status: {
      type: DataTypes.ENUM,
      values: [
        UserFormStatus.NEW,
        UserFormStatus.PENDING_APPROVAL,
        UserFormStatus.APPROVED,
        UserFormStatus.REJECTED,
        UserFormStatus.CLOSED
      ],
      allowNull: false,
      defaultValue: UserFormStatus.NEW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    deletedBy: {
      type: DataTypes.UUID
    },
    filledAt: {
      type: DataTypes.DATE
    },
    filledBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.UUID
    }
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'UserForm',
    tableName: 'user_forms',
    timestamps: false,
    underscored: true
  }
)

export default UserForm
