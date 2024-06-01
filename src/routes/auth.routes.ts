import { Router } from 'express'
import { getOauthGoogleRequestController, oauthController } from '../controllers/auth.controllers'
import { requestHandlerWrapper } from '../utils/handler'

const authRouter = Router()

/**
 * @swagger
 * /oauth-google/request:
 *   post:
 *     summary: Request OAuth with Google
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: The OAuth request was successfully created and returns a URL to Google OAuth 2.0 page for account selection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL to Google OAuth 2.0 page
 */
authRouter.post('/oauth-google/request', requestHandlerWrapper(getOauthGoogleRequestController))

/**
 * @swagger
 * /oauth-google:
 *   get:
 *     summary: Get OAuth with Google
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The authorization code from Google
 *     responses:
 *       302:
 *         description: Redirects the user to the front-end with the access and refresh tokens in the URL
 */
authRouter.get('/oauth-google', requestHandlerWrapper(oauthController))

export default authRouter
