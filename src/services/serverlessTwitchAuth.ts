/**
 * Serverless Twitch API Service
 * Uses Vercel functions to securely handle AWS credentials
 */

export interface TwitchCredentials {
  access_token: string
  client_id: string
}

class ServerlessTwitchAuth {
  private baseUrl: string

  constructor() {
    // In development, use localhost. In production, Vercel will handle this automatically
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3000' 
      : ''
  }

  /**
   * Get Twitch credentials from the serverless function
   */
  async getTwitchCredentials(): Promise<TwitchCredentials | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/twitch-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to get Twitch credentials:', errorData)
        return null
      }

      const credentials = await response.json()
      return credentials
    } catch (error) {
      // In development mode, this is expected to fail when using regular vite dev server
      if (import.meta.env.DEV) {
        console.info('Serverless function not available in local development (this is expected with vite dev server)')
      } else {
        console.error('Error calling twitch-auth function:', error)
      }
      return null
    }
  }
}

export const serverlessTwitchAuth = new ServerlessTwitchAuth()
