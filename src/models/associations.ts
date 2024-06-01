import Form from '../models/Form.model'
import FormDetail from '../models/FormDetail.model'
import Role from '../models/Role.model'
import User from '../models/User.model'
import UserRole from '../models/UserRole.model'
import UserFormDetail from '../models/UserFormDetail.model'
import UserForm from '../models/UserForm.model'
import RoleModule from '../models/RoleModule.model'
import RefreshToken from './RefreshToken.model'

export default function defineAssociations(): void {
  Form.hasMany(FormDetail, { foreignKey: 'formId', as: 'formDetails' })
  Form.hasMany(UserForm, { foreignKey: 'formId', as: 'userForms' })

  Role.hasMany(UserRole, { foreignKey: 'roleId', as: 'userRoles' })
  Role.hasMany(RoleModule, { foreignKey: 'roleId', as: 'roleModules' })

  User.belongsToMany(Role, { through: UserRole, as: 'roles', foreignKey: 'userId' })
  User.hasMany(UserForm, { foreignKey: 'userId' })

  Role.belongsToMany(User, { through: UserRole, as: 'roles', foreignKey: 'roleId' })

  FormDetail.hasMany(UserFormDetail, { foreignKey: 'formDetailsId' })
  UserRole.hasMany(UserFormDetail, { foreignKey: 'userFormId', as: 'userFormDetails' })

  UserForm.hasMany(UserFormDetail, { foreignKey: 'userFormId', as: 'userFormDetails' })
  UserForm.belongsTo(Form, { foreignKey: 'formId', as: 'form' })
  UserForm.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
  RoleModule.belongsTo(Role, { foreignKey: 'roleId', as: 'role' })
}
