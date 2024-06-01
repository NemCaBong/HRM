import { Model, DataTypes } from 'sequelize'
import databaseService from '../services/database.services'
import { UserStatus } from '../constants/enums'

class User extends Model {
  id!: string
  firstName!: string
  lastName!: string
  phone?: string
  address?: string
  email!: string
  insuranceNumber?: string
  citizenId?: string
  password!: string
  createdAt!: Date
  updatedAt?: Date
  isDeleted!: boolean
  updatedBy?: string
  deletedAt?: Date
  avatar?: string
  employeeId!: string
  status?: string
  managerId?: string
  roles?: string[]
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - createdAt
 *         - isDeleted
 *         - employeeId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the User
 *         firstName:
 *           type: string
 *           description: The first name of the User
 *         lastName:
 *           type: string
 *           description: The last name of the User
 *         phone:
 *           type: string
 *           description: The phone number of the User
 *         address:
 *           type: string
 *           description: The address of the User
 *         email:
 *           type: string
 *           description: The email of the User
 *         insuranceNumber:
 *           type: string
 *           description: The insurance number of the User
 *         citizenId:
 *           type: string
 *           description: The citizen id of the User
 *         password:
 *           type: string
 *           description: The password of the User
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the User was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the User was last updated
 *         isDeleted:
 *           type: boolean
 *           description: Whether the User is deleted
 *         updatedBy:
 *           type: string
 *           format: uuid
 *           description: The id of the user who last updated the User
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the User was deleted
 *         avatar:
 *           type: string
 *           description: The avatar of the User
 *         employeeId:
 *           type: string
 *           description: The employee id of the User
 *         status:
 *           type: string
 *           enum: [INTERN, PROBATION, OFFICIAL]
 *           description: The status of the User
 *         managerId:
 *           type: string
 *           format: uuid
 *           description: The id of the manager of the User
 */
User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    phone: DataTypes.STRING(15),
    address: DataTypes.STRING(500),
    email: {
      type: DataTypes.STRING(300),
      allowNull: false,
      unique: true
    },
    insuranceNumber: DataTypes.STRING(30),
    citizenId: DataTypes.STRING(20),
    password: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: DataTypes.DATE,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    updatedBy: DataTypes.UUID,
    deletedAt: DataTypes.DATE,
    avatar: DataTypes.STRING(2048),
    employeeId: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM(),
      values: [UserStatus.INTERN, UserStatus.PROBATION, UserStatus.OFFICIAL]
    },
    managerId: DataTypes.UUID
  },
  {
    sequelize: databaseService.getSequelize(),
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: false
  }
)

export default User
