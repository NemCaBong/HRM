import { Model, DataTypes, UUIDV4 } from 'sequelize'
import databaseService from '../services/database.services'

class UserFormDetail extends Model {}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserFormDetail:
 *       type: object
 *       required:
 *         - id
 *         - userFormId
 *         - formDetailsId
 *         - isDeleted
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the UserFormDetail
 *         userFormId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated user form
 *         formDetailsId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated form details
 *         answer:
 *           type: string
 *           description: The answer provided by the user
 *         evaluation:
 *           type: string
 *           description: The evaluation of the user's answer
 *         isDeleted:
 *           type: boolean
 *           description: Whether the UserFormDetail is deleted
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the UserFormDetail was deleted
 */
UserFormDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    userFormId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    formDetailsId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    answer: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    evaluation: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'UserFormDetails',
    tableName: 'user_form_details',
    timestamps: false,
    underscored: true
  }
)

export default UserFormDetail
