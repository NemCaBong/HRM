import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

const env = process.env.NODE_ENV
console.log(env)
const envFilename = `.env.${(env as string).trim()}`
console.log(envFilename)

if (!env) {
  console.log(`Chưa cung cấp biến môi trường NODE_ENV (ví dụ: development, production)`)
  console.log(`Phát hiện NODE_ENV = ${env}`)
  process.exit(1)
}

console.log(`Phát hiện NODE_ENV = ${env}, vì thế app sẽ dùng file môi trường là ${envFilename}`)

if (!fs.existsSync(path.resolve(envFilename))) {
  console.log(`Không tìm thấy file môi trường ${envFilename}`)
  console.log(`Lưu ý: App không dùng file .env, ví dụ môi trường là development thì app sẽ dùng file .env.development`)
  console.log(`Vui lòng tạo file ${envFilename} và tham khảo nội dung ở file .env.example`)
  process.exit(1)
}

config({
  path: path.resolve(envFilename)
})

export const isProduction = env === 'production'
export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  dbHost: process.env.DB_HOST as string,
  dbName: process.env.DB_NAME as string,
  dbUser: process.env.DB_USER as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbPort: process.env.DB_PORT as string,
  saltRounds: parseInt(process.env.SALT_ROUNDS as string),
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  mailUser: process.env.MAIL_USER as string,
  mailAppPass: process.env.MAIL_APP_PASS as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  feUrl: process.env.FE_URL as string,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string
}
