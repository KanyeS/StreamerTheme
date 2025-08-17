import axios from 'axios'
import { parameterStore } from './parameterStore'
import { serverlessTwitchUserAuth } from './serverlessTwitchUserAuth'
import config from '../config'

// Force rebuild - Updated Aug 17 2025 10:10PM

interface TwitchUserOAuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string[]
  token_type: string
}

interface TwitchUserTokenInfo {
  client_id: string
  login: string
  scopes: string[]
  user_id: string
  expires_in: number
}

class TwitchUserOAuthService {
  private baseUrl = 'https://id.twitch.tv/oauth2'
  private redirectUri = import.meta.env.DEV 
    ? 'https://localhost:3000' 
    : 'https://streamertheme.vercel.app'
  
  /**
   * Required scopes for full broadcaster access
   */
  private readonly scopes = [
    'user:read:email',
    'channel:read:subscriptions',
    'moderator:read:followers'
  ]

  /**
   * Generate the authorization URL for user login
   */
  async getAuthorizationUrl(): Promise<string> {
    let clientId: string
    
    // Use serverless mode in production, Parameter Store in development
    if (config.development.useServerlessMode) {
      const credentials = await serverlessTwitchUserAuth.getClientId()
      if (!credentials?.client_id) {
        throw new Error('Client ID not found in serverless function')
      }
      clientId = credentials.client_id
    } else {
      const credentials = await parameterStore.getTwitchCredentials()
      if (!credentials.clientId) {
        throw new Error('Client ID not found in Parameter Store')
      }
      clientId = credentials.clientId
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state: this.generateState() // CSRF protection
    })

    const authUrl = `${this.baseUrl}/authorize?${params.toString()}`
    
    // Log authorization details for debugging
    console.log('🔗 Generating Twitch Authorization URL:', {
      clientId: clientId,
      redirectUri: this.redirectUri,
      scopes: this.scopes,
      authUrl: authUrl,
      note: 'Make sure this redirect_uri exactly matches your Twitch app settings'
    })

    return authUrl
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TwitchUserOAuthResponse | null> {
    try {
      // Debug logging for environment detection
      console.log('🔍 OAuth Environment Debug:', {
        isDev: import.meta.env.DEV,
        useServerlessMode: config.development.useServerlessMode,
        useParameterStore: !config.development.useServerlessMode
      })
      
      // Use serverless mode in production, Parameter Store in development
      if (config.development.useServerlessMode) {
        console.log('📡 Using serverless mode for token exchange')
        const tokenData = await serverlessTwitchUserAuth.exchangeCodeForToken(code, this.redirectUri)
        return tokenData
      } else {
        console.log('🏗️ Using Parameter Store mode for token exchange')
        // Development mode - use Parameter Store
        const credentials = await parameterStore.getTwitchCredentials()
        
        if (!credentials.clientId || !credentials.clientSecret) {
          throw new Error('Missing credentials in Parameter Store')
        }

        const response = await axios.post(`${this.baseUrl}/token`, {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return response.data
      }
    } catch (error) {
      console.error('Failed to exchange code for token:', error)
      return null
    }
  }

  /**
   * Refresh an expired user access token
   */
  async refreshUserToken(refreshToken: string): Promise<TwitchUserOAuthResponse | null> {
    try {
      // Use serverless mode in production, Parameter Store in development
      if (config.development.useServerlessMode) {
        const tokenData = await serverlessTwitchUserAuth.refreshUserToken(refreshToken)
        return tokenData
      } else {
        // Development mode - use Parameter Store
        const credentials = await parameterStore.getTwitchCredentials()
        
        if (!credentials.clientId || !credentials.clientSecret) {
          throw new Error('Missing credentials in Parameter Store')
        }

        const response = await axios.post(`${this.baseUrl}/token`, {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return response.data
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return null
    }
  }

  /**
   * Validate a user access token
   */
  async validateUserToken(accessToken: string): Promise<TwitchUserTokenInfo | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/validate`, {
        headers: {
          'Authorization': `OAuth ${accessToken}`
        }
      })

      return response.data
    } catch (error) {
      console.error('Token validation failed:', error)
      return null
    }
  }

  /**
   * Store tokens in localStorage (in production, use secure storage)
   */
  storeTokens(tokens: TwitchUserOAuthResponse): void {
    localStorage.setItem('twitch_access_token', tokens.access_token)
    localStorage.setItem('twitch_refresh_token', tokens.refresh_token)
    localStorage.setItem('twitch_expires_at', (Date.now() + (tokens.expires_in * 1000)).toString())
  }

  /**
   * Get stored tokens from localStorage
   */
  getStoredTokens(): { accessToken: string | null, refreshToken: string | null, expiresAt: number } {
    return {
      accessToken: localStorage.getItem('twitch_access_token'),
      refreshToken: localStorage.getItem('twitch_refresh_token'),
      expiresAt: parseInt(localStorage.getItem('twitch_expires_at') || '0')
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem('twitch_access_token')
    localStorage.removeItem('twitch_refresh_token')
    localStorage.removeItem('twitch_expires_at')
  }

  /**
   * Check if user is logged in and token is valid
   */
  async isLoggedIn(): Promise<boolean> {
    const { accessToken, expiresAt } = this.getStoredTokens()
    
    if (!accessToken || Date.now() > expiresAt) {
      return false
    }

    const tokenInfo = await this.validateUserToken(accessToken)
    return !!tokenInfo
  }

  /**
   * Get a valid user access token (refresh if needed)
   */
  async getValidUserToken(): Promise<string | null> {
    const { accessToken, refreshToken, expiresAt } = this.getStoredTokens()
    
    if (!accessToken) {
      return null // User needs to log in
    }

    // If token expires within 1 hour, refresh it
    if (Date.now() > (expiresAt - 3600000)) {
      if (refreshToken) {
        const newTokens = await this.refreshUserToken(refreshToken)
        if (newTokens) {
          this.storeTokens(newTokens)
          return newTokens.access_token
        }
      }
      // Refresh failed, user needs to log in again
      this.clearTokens()
      return null
    }

    return accessToken
  }

  /**
   * Generate a random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Handle the OAuth redirect (call this on page load)
   */
  async handleOAuthRedirect(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    const state = urlParams.get('state')

    // Log all OAuth redirect parameters for debugging
    console.log('🔍 OAuth Redirect Debug Info:', {
      currentUrl: window.location.href,
      redirectUri: this.redirectUri,
      code: code ? 'present' : 'missing',
      error: error,
      errorDescription: errorDescription,
      state: state,
      allParams: Object.fromEntries(urlParams.entries())
    })

    if (error) {
      console.error('❌ OAuth Authorization Error:', {
        error: error,
        description: errorDescription,
        expectedRedirectUri: this.redirectUri,
        actualUrl: window.location.href
      })
      
      if (error === 'redirect_mismatch') {
        console.error('🔧 Redirect URI Mismatch Fix:', {
          problem: 'The redirect_uri in your Twitch app does not match',
          currentRedirectUri: this.redirectUri,
          solution: `Add "${this.redirectUri}" to your Twitch app's OAuth Redirect URLs`,
          twitchConsole: 'https://dev.twitch.tv/console'
        })
      }
      
      return false
    }

    if (code) {
      console.log('✅ OAuth authorization successful, exchanging code for token...')
      const tokens = await this.exchangeCodeForToken(code)
      if (tokens) {
        console.log('🎉 Token exchange successful, storing tokens')
        this.storeTokens(tokens)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return true
      } else {
        console.error('❌ Failed to exchange authorization code for token')
      }
    }

    return false
  }
}

// Export singleton instance
export const twitchUserOAuth = new TwitchUserOAuthService()
export default TwitchUserOAuthService
