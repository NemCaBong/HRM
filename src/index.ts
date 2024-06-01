import express, { Express } from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import databaseService from './services/database.services'
import indexRouter from './routes/index.routes'
import { defaultErrorHandler } from './utils/handler'
import defineAssociations from './models/associations'
import { swaggerDefinitions } from './config/swaggerDef'
import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from './config/env'

const app: Express = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// connect db
databaseService.connectAndPing()
defineAssociations()

// Routes
indexRouter(app)

// Error handler
app.use(defaultErrorHandler)

const options: swaggerJsdoc.Options = {
  swaggerDefinition: swaggerDefinitions,
  apis: ['./src/routes/*.routes.ts', './src/models/*.model.ts', './src/middlewares/*.middlewares.ts']
}
const swaggerSpec = swaggerJsdoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const port = envConfig.port || 4000
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

export default app
