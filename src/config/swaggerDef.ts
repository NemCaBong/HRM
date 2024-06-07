import { SwaggerDefinition } from 'swagger-jsdoc'
import { config } from 'dotenv'

config()
const env = process.env.NODE_ENV

export const swaggerDefinitions: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'VMO-HRM API',
    version: '1.0.0',
    description: 'The API documentation for VMO-HRM project',
    contact: {
      name: 'Nguyễn Minh Hoàng',
      email: 'hoangnm2@vmogroup.com'
    }
  },
  servers: [
    {
      url: `http://localhost:${env === 'production' ? 5000 : 8080}`,
      description: 'Local server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        // This key should match the security reference below
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: [] // Corrected to match the key in securitySchemes
    }
  ]
}
