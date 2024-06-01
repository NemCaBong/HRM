import { EventEmitter } from 'stream'
import { MailOptions } from '../constants/email'
import { sendMail } from '../utils/sendMail'

class EmailEmitter extends EventEmitter {}

const emailEmitter = new EmailEmitter()

emailEmitter.on('sendMail', async ({ to, subject, text, html }: MailOptions) => {
  return sendMail({ to, subject, text, html })
    .then(() => {
      emailEmitter.emit('sendMail success', { to, subject })
    })
    .catch((err) => {
      emailEmitter.emit('sendMail failed', { to, subject, error: err.message })
      console.log(err.message)
    })
})

emailEmitter.on('sendMail success', ({ to, subject }: { to: string; subject: string }) => {
  console.log(`Email successfully sent to ${to} with subject: ${subject}`)
})

emailEmitter.on('sendMail failed', ({ to, subject, error }: { to: string; subject: string; error: any }) => {
  console.error(`Failed to send email to ${to} with subject: ${subject}. Error: ${error.message}`)
})

export default emailEmitter
