import nodemailer from 'nodemailer'
import { MailOptions } from '../constants/email'
import { envConfig } from '../config/env'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: envConfig.mailUser,
    pass: envConfig.mailAppPass
  }
})

export const sendMail = async ({ to, subject, text, html }: MailOptions) => {
  return await transporter.sendMail({
    from: envConfig.mailUser,
    to,
    subject,
    text,
    html
  })
}
