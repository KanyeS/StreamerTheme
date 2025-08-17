/**
 * Serverless Twitch User OAuth Service
 * Uses Vercel functions to securely handle user OAuth flows
 */

export interface TwitchUserTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string[]
  token_type: string
}

class ServerlessTwitchUserAuth {
  private baseUrl: string

  constructor() {
    // In development, use localhost. In production, Vercel will handle this automatically
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3000' 
      : ''
  }

  /**
   * Get client ID for authorization URL generation
   */
  async getClientId(): Promise<{ client_id: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/twitch-auth?client_only=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to get client ID:', errorData)
        return null
      }

      const data = await response.json()
      return data
    } catch (error) {
      // In development mode, this is expected to fail when using regular vite dev server
      if (import.meta.env.DEV) {
        console.info('Serverless function not available in local development (this is expected with vite dev server)')
      } else {
        console.error('Error calling twitch-auth function for client ID:', error)
      }
      return null
    }
  }

  /**
   * Exchange authorization code for user tokens
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TwitchUserTokenResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/twitch-user-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to exchange code for user token:', errorData)
        return null
      }

      const tokenData = await response.json()
      return tokenData
    } catch (error) {
      // In development mode, this is expected to fail when using regular vite dev server
      if (import.meta.env.DEV) {
        console.info('Serverless user token function not available in local development (this is expected with vite dev server)')
      } else {
        console.error('Error calling twitch-user-token function:', error)
      }
      return null
    }
  }

  /**
   * Refresh user access token
   */
  async refreshUserToken(refreshToken: string): Promise<TwitchUserTokenResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/twitch-user-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to refresh user token:', errorData)
        return null
      }

      const tokenData = await response.json()
      return tokenData
    } catch (error) {
      // In development mode, this is expected to fail when using regular vite dev server
      if (import.meta.env.DEV) {
        console.info('Serverless user token function not available in local development (this is expected with vite dev server)')
      } else {
        console.error('Error calling twitch-user-token function:', error)
      }
      return null
    }
  }
}

export const serverlessTwitchUserAuth = new ServerlessTwitchUserAuth()
