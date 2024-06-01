import { FindOptions, WhereOptions } from 'sequelize'
import { TokenType, UserStatus } from '../constants/enums'
import { OrderArray } from '../constants/order'
import { PaginationResult } from '../constants/types'
import CustomDatabaseError from '../errors/DatabaseError'
import RefreshToken from '../models/RefreshToken.model'
import Role from '../models/Role.model'
import RoleModule from '../models/RoleModule.model'
import User from '../models/User.model'
import { UpdateMeReqBody } from '../models/requests/User.requests'
import { verifyToken } from '../utils/jwt'
import { signToken } from '../utils/jwt'
import { v4 as uuidv4 } from 'uuid'
import databaseService from './database.services'
import { ROLES_NAME, ReturnedPermissions, RoleType } from '../constants/roles'
import { Op } from 'sequelize'
import bcrypt from 'bcrypt'
import { hashedPassword } from '../utils/crypto'
import { OAuth2Client } from 'google-auth-library'
import NotFoundError from '../errors/NotFoundError'
import UserRole from '../models/UserRole.model'
import UserForm from '../models/UserForm.model'
import { envConfig } from '../config/env'

class UserService {
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, secretOrPublicKey: envConfig.jwtSecretRefreshToken as string })
  }

  private signAccessToken({ userId, roles }: { userId: string; roles: string[] }) {
    return signToken({
      payload: {
        user_id: userId,
        token_type: TokenType.AccessToken,
        roles
      },
      privateKey: envConfig.jwtSecretAccessToken as string,
      options: {
        expiresIn: envConfig.accessTokenExpiresIn
      }
    })
  }

  private signRefreshToken({ userId, roles, exp }: { userId: string; roles: string[]; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id: userId,
          // userId,
          token_type: TokenType.RefreshToken,
          roles,
          exp
        },
        privateKey: envConfig.jwtSecretRefreshToken as string
      })
    }
    return signToken({
      payload: {
        user_id: userId,
        // userId,
        token_type: TokenType.RefreshToken,
        roles
      },
      privateKey: envConfig.jwtSecretRefreshToken as string,
      options: {
        expiresIn: envConfig.refreshTokenExpiresIn
      }
    })
  }

  private signAccessAndRefreshToken({ userId, roles }: { userId: string; roles: string[] }) {
    return Promise.all([this.signAccessToken({ userId, roles }), this.signRefreshToken({ userId, roles })])
  }

  async getPermissionsByRoles(roles: RoleType[]) {
    const roleIds = await Role.findAll({
      where: {
        name: {
          [Op.in]: roles
        }
      },
      attributes: ['id', 'name'],
      raw: true
    })

    const roleModulesPromises = roleIds.map((role: { id: string; name: string }) =>
      RoleModule.findAll({
        where: {
          roleId: role.id,
          isDeleted: false
        },
        attributes: ['api', 'isCanRead', 'isCanAdd', 'isCanEdit', 'isCanDelete', 'isCanApprove'],
        raw: true
      })
    )

    const returnedPermissions = {} as ReturnedPermissions
    const roleModulesArray = await Promise.all(roleModulesPromises)
    const roleNameList = roleIds.map((role) => role.name)

    roleModulesArray.forEach((roleModules, index) => {
      returnedPermissions[roleNameList[index]] = roleModules
    })

    return returnedPermissions
  }

  async getRoles(userId: string) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [], where: { isDeleted: false } }
        }
      ],
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'address', 'avatar', 'status', 'employee_id']
    })
    const roles = user?.toJSON().roles

    const roleNames = roles.map((role: Role) => {
      return role.name
    })
    return { roles: roleNames }
  }

  async login(userId: string, roles: string[]) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ userId, roles })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    // save refresh_token to db
    const refreshToken = new RefreshToken({
      id: uuidv4(),
      token: refresh_token,
      userId,
      iat,
      exp,
      createdAt: new Date()
    })

    await refreshToken.save()

    return { access_token, refresh_token }
  }

  async updateMe(user_id: string, updatedInfo: UpdateMeReqBody) {
    await User.update(updatedInfo, { where: { id: user_id } })
  }

  async getMe(user_id: string) {
    const user = await User.findByPk(user_id, {
      attributes: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'address',
        'avatar',
        'status',
        'employeeId',
        'insuranceNumber',
        'citizenId',
        'managerId'
      ]
    })

    return user
  }

  async getManager(userId: string) {
    const { managerId } = (await User.findByPk(userId, {
      attributes: ['managerId'],
      raw: true
    })) as User

    if (!managerId) throw new NotFoundError({ message: 'User not have manager', context: { method: 'getManager' } })

    const manager = await User.findByPk(managerId, { raw: true })

    if (!manager) throw new NotFoundError({ message: 'Manager not found', context: { method: 'getManager' } })

    return manager
  }

  async getUsers({
    pagination,
    orderArray,
    filter
  }: {
    pagination: PaginationResult
    orderArray: OrderArray
    filter: {
      firstName?: string
      lastName?: string
      email?: string
      employeeId?: string
      isDeleted?: boolean
      managerId?: string
      status?: UserStatus | 'ALL'
    }
  }) {
    try {
      const whereClause: WhereOptions = {}

      if (filter.status !== 'ALL') {
        whereClause.status = filter.status
      }

      if (filter.firstName) {
        whereClause.firstName = { [Op.like]: `%${filter.firstName}%` }
      }
      if (filter.lastName) {
        whereClause.lastName = { [Op.like]: `%${filter.lastName}%` }
      }
      if (filter.email) {
        whereClause.email = { [Op.like]: `%${filter.email}%` }
      }

      if (filter.employeeId) {
        whereClause.employeeId = filter.employeeId
      }

      if (filter.isDeleted !== undefined) {
        whereClause.isDeleted = filter.isDeleted
      }

      if (filter.managerId) {
        whereClause.managerId = filter.managerId
      }

      const queryOptions: FindOptions = {
        where: whereClause,
        limit: pagination.limit,
        offset: pagination.offset,
        order: orderArray,
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'avatar', 'status']
      }

      return User.findAll(queryOptions)
    } catch (err: any) {
      throw new CustomDatabaseError({ message: err.message, context: { method: 'getUsers', error: err.message } })
    }
  }

  async refreshToken({
    userId,
    refreshToken,
    exp,
    roles
  }: {
    userId: string
    refreshToken: string
    exp: number
    roles: string[]
  }) {
    const transaction = await databaseService.getSequelize().transaction()

    try {
      const [accessToken, newRefreshToken] = await Promise.all([
        this.signAccessToken({ userId, roles }),
        this.signRefreshToken({ userId, roles, exp }),
        RefreshToken.destroy({ where: { token: refreshToken }, transaction })
      ])

      const decoded_refresh_token = await this.decodeRefreshToken(newRefreshToken)

      const refreshTokenStored = new RefreshToken({
        id: uuidv4(),
        token: newRefreshToken,
        userId: userId,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp,
        createdAt: new Date()
      })

      await refreshTokenStored.save({ transaction })

      await transaction.commit()
      return { access_token: accessToken, refresh_token: newRefreshToken }
    } catch (err: any) {
      await transaction.rollback()
      throw new CustomDatabaseError({ message: err.message, context: { method: 'refreshToken' } })
    }
  }

  async changePassword({ userId, oldPassword, password }: { userId: string; oldPassword: string; password: string }) {
    const user = await User.findByPk(userId, { attributes: ['password'], raw: true })
    if (!user) throw new CustomDatabaseError({ message: 'User not found', context: { method: 'changePassword' } })

    const result = await bcrypt.compare(oldPassword, user.password)
    if (!result) {
      throw new CustomDatabaseError({ message: 'Old password is incorrect', context: { method: 'changePassword' } })
    }

    const hashPass = await hashedPassword(password)
    await User.update({ password: hashPass }, { where: { id: userId } })
  }

  async deleteUser(userId: string) {
    await User.update({ isDeleted: true, deletedAt: new Date() }, { where: { id: userId } })
  }

  async updateStatus(userId: string, status: UserStatus) {
    await User.update({ status }, { where: { id: userId } })
  }

  async getUserDataGoogleOAuth(code: string) {
    const oAuth2Client = new OAuth2Client(
      envConfig.googleClientId as string,
      envConfig.googleClientSecret,
      envConfig.googleRedirectUri as string
    )

    const response = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(response.tokens)
    const userCredentials = oAuth2Client.credentials

    const userData = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${userCredentials.access_token}`
    )
    const userDataJson = await userData.json()

    return userDataJson
  }

  async getRequestUrlGoogleOAuth() {
    const oAuth2Client = new OAuth2Client(
      envConfig.googleClientId as string,
      envConfig.googleClientSecret,
      envConfig.googleRedirectUri as string
    )

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // for testing mode, make sure refresh_token is always sent
      scope: 'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',
      prompt: 'consent'
    })
    return authorizeUrl
  }

  private async assignRole(userId: string, roleName: RoleType) {
    const role = await Role.findOne({ where: { name: roleName }, raw: true })

    if (!role) throw new NotFoundError({ message: 'Role not found', context: { method: 'assignRole' } })

    await UserRole.create({ userId, roleId: role.id, id: uuidv4(), isDeleted: false })
  }

  async oAuth2Google(code: string) {
    const userData = await this.getUserDataGoogleOAuth(code)

    const userInDB = await User.findOne({ where: { email: userData.email }, raw: true })

    if (userInDB) {
      const { roles } = await this.getRoles(userInDB.id)
      const { access_token, refresh_token } = await this.login(userInDB.id, roles)

      return { access_token, refresh_token }
    }
    const userId = uuidv4()
    const user = new User({
      id: userId,
      email: userData.email,
      firstName: userData.given_name,
      lastName: userData.family_name,
      avatar: userData.picture,
      status: UserStatus.INTERN,
      password: await hashedPassword(userData.sub), // hiện tại tự tạo ra password cho user google
      employeeId: '0000', // tự update sau,
      createdAt: new Date()
    })

    const [, , { access_token, refresh_token }] = await Promise.all([
      user.save(),
      this.assignRole(userId, ROLES_NAME.Employee as RoleType),
      this.login(userId, [ROLES_NAME.Employee as RoleType])
    ])

    return { access_token, refresh_token }
  }

  async getUser(userId: string) {
    return User.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'address',
        'avatar',
        'status',
        'employeeId',
        'managerId',
        'citizenId',
        'insuranceNumber',
        'isDeleted'
      ],
      raw: true
    })
  }

  async getUserByEmail(email: string) {
    return User.findOne({ where: { email }, raw: true })
  }

  async undeleteUser(userId: string) {
    await User.update({ isDeleted: false, deletedAt: null }, { where: { id: userId } })
  }

  async uploadAvatar(userId: string, fileUrl: string) {
    await User.update({ avatar: fileUrl }, { where: { id: userId } })
  }

  async getUserByUserFormId(userFormId: string) {
    const userForm = (await UserForm.findOne({ where: { id: userFormId }, raw: true })) as UserForm

    if (!userForm)
      throw new NotFoundError({ message: 'User form not found', context: { method: 'getUserByUserFormId' } })

    return this.getUser(userForm.userId)
  }

  async getAllUserRoles({
    orderArray,
    pagination,
    filter
  }: {
    orderArray: OrderArray
    pagination: PaginationResult
    filter: { firstName?: string; lastName?: string; email?: string; status?: UserStatus; employeeId?: string }
  }) {
    // Construct dynamic where clause
    const whereClause: WhereOptions = {}
    if (filter.firstName) {
      whereClause.firstName = { [Op.like]: `%${filter.firstName}%` }
    }
    if (filter.lastName) {
      whereClause.lastName = { [Op.like]: `%${filter.lastName}%` }
    }
    if (filter.email) {
      whereClause.email = { [Op.like]: `%${filter.email}%` }
    }
    if (filter.status) {
      whereClause.status = filter.status
    }
    if (filter.employeeId) {
      whereClause.employeeId = filter.employeeId
    }

    const findOptions: FindOptions = {
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'avatar', 'status'],
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: ['isDeleted', 'id'], as: 'userRoles' },
          attributes: ['id', 'name', 'description']
        }
      ],
      offset: pagination.offset,
      limit: pagination.limit
    }

    if (orderArray.length > 0 && orderArray[0][0] === 'roleName') {
      findOptions.order = [[{ model: Role, as: 'roles' }, 'name', orderArray[0][1]]]
    } else {
      findOptions.order = orderArray
    }

    return User.findAll(findOptions)
  }

  async getUserRoleByUserId(userId: string) {
    return User.findOne({
      where: { id: userId },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: ['isDeleted', 'id'], as: 'userRoles' }
        }
      ]
    })
  }
}

const usersService = new UserService()

export default usersService
