import { DataTypes, Model } from 'sequelize'
import databaseService from '../services/database.services'

class RefreshToken extends Model {
  id!: string
  token!: string
  user_id!: string
  iat!: string
  exp!: Date
  created_at?: Date
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshToken:
 *       type: object
 *       required:
 *         - id
 *         - token
 *         - userId
 *         - iat
 *         - exp
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The id of the RefreshToken
 *         token:
 *           type: string
 *           description: The token of the RefreshToken
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The id of the associated user
 *         iat:
 *           type: string
 *           format: date-time
 *           description: The issued at time of the RefreshToken
 *         exp:
 *           type: string
 *           format: date-time
 *           description: The expiration time of the RefreshToken
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation time of the RefreshToken
 */
RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    iat: {
      type: DataTypes.DATE,
      allowNull: false
    },
    exp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize: databaseService.getSequelize(),
    tableName: 'refresh_tokens',
    modelName: 'RefreshToken',
    underscored: true,
    timestamps: false
  }
)

export default RefreshToken
