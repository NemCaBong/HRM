// This file extends the 'express' module by adding a new property to the 'Request' interface.
// The 'user' property is of type 'User' and represents the authenticated user making the request.
// This allows us to access the user object in the request handlers.
import { Request } from 'express'
import { TokenPayload } from './models/requests/User.requests'
import UserForm from './models/UserForm.model'
import Form from './models/Form.model'
import User from './models/User.model'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    userForm?: UserForm
    form?: Form
  }
}
