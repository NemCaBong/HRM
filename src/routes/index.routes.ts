import { Express } from 'express'
import usersRouter from './users.routes'
import formsRouter from './forms.routes'
import userformsRouter from './userforms.routes'
import reportsRouter from './reports.routes'
import authRouter from './auth.routes'
import rolesRouter from './roles.routes'
import userRolesRouter from './userroles.routes'
import roleModulesRouter from './rolemodules.routes'

const indexRouter = (app: Express) => {
  app.use('/api/users', usersRouter)
  app.use('/api/forms', formsRouter)
  app.use('/api/user-forms', userformsRouter)
  app.use('/api/reports', reportsRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/roles', rolesRouter)
  app.use('/api/user-roles', userRolesRouter)
  app.use('/api/role-modules', roleModulesRouter)
}

export default indexRouter
