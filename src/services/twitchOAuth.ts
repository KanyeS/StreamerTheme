import axios from 'axios'
import { parameterStore } from './parameterStore'
import { serverlessTwitchAuth } from './serverlessTwitchAuth'
import config from '../config'

interface TwitchOAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string[]
  token_type: string
}

interface TokenInfo {
  client_id: string
  login: string
  scopes: string[]
  user_id: string
  expires_in: number
}

class TwitchOAuthService {
  private baseUrl = 'https://id.twitch.tv/oauth2'
  
  /**
   * Generate a new access token using Client Credentials flow
   * This is perfect for app-only access (no user login required)
   */
  async generateAppAccessToken(): Promise<string | null> {
    try {
      // If using serverless mode, get the token directly from the serverless function
      if (config.development.useServerlessMode) {
        console.log('Getting access token from serverless function')
        const credentials = await serverlessTwitchAuth.getTwitchCredentials()
        
        if (credentials?.access_token) {
          console.log('Received access token from serverless function')
          return credentials.access_token
        } else {
          console.error('Failed to get access token from serverless function')
          return null
        }
      }

      // Traditional Parameter Store approach
      const credentials = await parameterStore.getTwitchCredentials()
      
      if (!credentials.clientId || !credentials.clientSecret) {
        console.error('Missing Client ID or Client Secret in Parameter Store')
        return null
      }

      const response = await axios.post(`${this.baseUrl}/token`, null, {
        params: {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          grant_type: 'client_credentials',
          scope: 'user:read:email channel:read:subscriptions moderation:read'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const data: TwitchOAuthResponse = response.data
      console.log('Generated new Twitch access token:', {
        expires_in: data.expires_in,
        scopes: data.scope
      })

      return data.access_token
    } catch (error) {
      console.error('Failed to generate Twitch access token:', error)
      return null
    }
  }

  /**
   * Validate an existing access token
   */
  async validateToken(accessToken: string): Promise<TokenInfo | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/validate`, {
        headers: {
          'Authorization': `OAuth ${accessToken}`
        }
      })

      return response.data as TokenInfo
    } catch (error) {
      console.error('Token validation failed:', error)
      return null
    }
  }

  /**
   * Get a fresh, valid access token (always generates new)
   */
  async ensureValidToken(): Promise<string | null> {
    console.log('Generating fresh Twitch access token...')
    return await this.generateAppAccessToken()
  }

  /**
   * Get a fresh, valid access token
   */
  async getValidAccessToken(): Promise<string | null> {
    return await this.ensureValidToken()
  }
}

// Export singleton instance
export const twitchOAuth = new TwitchOAuthService()
export default TwitchOAuthService
