import config from '../config'
import { serverlessTwitchAuth } from './serverlessTwitchAuth'

// Parameter Store service (now using serverless functions)
class ParameterStoreService {
  private isConfigured: boolean = false

  constructor() {
    try {
      // Check if we should use serverless mode
      if (config.development.useServerlessMode) {
        console.log('Using serverless mode for Twitch credentials')
        this.isConfigured = true
        return
      }

      // Legacy direct access mode (not recommended for production)
      console.warn('Direct Parameter Store access mode - credentials would need to be in environment variables')
      this.isConfigured = false
    } catch (error) {
      console.warn('Failed to initialize Parameter Store service:', error)
      this.isConfigured = false
    }
  }

  /**
   * Get Twitch-specific parameters
   */
  async getTwitchCredentials(): Promise<{
    clientId: string | null
    clientSecret: string | null
  }> {
    // Use serverless mode if enabled
    if (config.development.useServerlessMode) {
      console.log('Getting Twitch credentials via serverless function')
      const credentials = await serverlessTwitchAuth.getTwitchCredentials()
      
      if (credentials) {
        return {
          clientId: credentials.client_id,
          clientSecret: null // We don't need the secret in the frontend
        }
      } else {
        console.warn('Failed to get credentials from serverless function - falling back to demo mode')
        return {
          clientId: null,
          clientSecret: null
        }
      }
    }

    // Fallback mode (demo mode)
    console.log('Using demo mode for development')
    return {
      clientId: null,
      clientSecret: null
    }
  }
}

// Export singleton instance
export const parameterStore = new ParameterStoreService()
export default ParameterStoreService
