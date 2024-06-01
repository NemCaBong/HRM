import { Request, Response } from 'express'
import usersService from '../services/users.services'
import { envConfig } from '../config/env'

/**
 * This function generates a new OAuth2Client request URL for the front-end to ping.
 * After pinging, it redirects to the Google OAuth login page to get the authorization code.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns the authorization URL in the response
 */
export const getOauthGoogleRequestController = async (req: Request, res: Response): Promise<Response> => {
  // Deal with CORS
  res.header('Access-Controll-Allow-Origin', `${envConfig.feUrl}`)
  res.header('Referrer-Policy', 'no-referrer-when-downgrade')
  res.header('Access-Control-Allow-Credentials', 'true')

  const authorizeUrl = await usersService.getRequestUrlGoogleOAuth()
  return res.status(200).json({
    message: 'OAuth Google Success',
    result: {
      url: authorizeUrl
    }
  })
}

/**
 * This function handles the OAuth process after the user has been redirected back from Google.
 * It takes the authorization code from the request, exchanges it for access and refresh tokens,
 * and then redirects the user back to the front-end with the tokens in the URL.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Redirects the user back to the front-end
 */
export const oauthController = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string

  // Exchange the authorization code for access and refresh tokens
  const { access_token, refresh_token } = await usersService.oAuth2Google(code)

  // Construct the redirect URL with the tokens
  const redirectUrl = `${envConfig.feUrl}/?access_token=${access_token}&refresh_token=${refresh_token}`

  return res.redirect(redirectUrl)
}
