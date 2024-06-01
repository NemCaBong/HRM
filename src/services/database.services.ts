import { Sequelize } from 'sequelize'
import { envConfig } from '../config/env'

class DatabaseService {
  private sequelize: Sequelize

  constructor() {
    this.sequelize = new Sequelize({
      host: envConfig.dbHost,
      port: Number(envConfig.dbPort),
      database: envConfig.dbName,
      username: envConfig.dbUser,
      password: envConfig.dbPassword,
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  }

  getSequelize(): Sequelize {
    return this.sequelize
  }

  async connectAndPing(): Promise<void> {
    try {
      // Connect to the database
      await this.sequelize.authenticate()
      console.log('Connection has been established successfully.')

      // Ping the database to confirm the connection
      await this.sequelize.query('SELECT 1')
      console.log('Database ping successful.')
    } catch (error) {
      console.log('Unable to connect to the database:', error)
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
