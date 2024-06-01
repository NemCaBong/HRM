import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '../../constants/enums'
import { RoleType } from '../../constants/roles'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  roles: RoleType[]
  exp: number
  iat: number
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface UpdateMeReqBody {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  insuranceNumber?: string
  citizenId?: string
  avatar?: string
  employeeId?: string
  status?: string
  managerId?: string
}
