import bcrypt from 'bcrypt'
import { envConfig } from '../config/env'

export const hashedPassword = async (password: string) => {
  return await bcrypt.hash(password, envConfig.saltRounds || '10')
}
