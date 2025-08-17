import { SSMClient, GetParameterCommand, GetParametersCommand } from '@aws-sdk/client-ssm'
import config from '../config'
import { serverlessTwitchAuth } from './serverlessTwitchAuth'

// AWS Parameter Store service
class ParameterStoreService {
  private ssmClient: SSMClient | null = null
  private isConfigured: boolean = false

  constructor(region: string = config.aws.region) {
    try {
      // Check if we should use serverless mode
      if (config.development.useServerlessMode) {
        console.log('Using serverless mode for Twitch credentials')
        this.isConfigured = true
        return
      }

      // Check if we're in a browser environment
      const isBrowser = typeof window !== 'undefined'
      
      const credentials = {
        accessKeyId: isBrowser ? import.meta.env.VITE_AWS_ACCESS_KEY_ID || '' : '',
        secretAccessKey: isBrowser ? import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '' : '',
      }

      // Only create SSM client if credentials are provided
      if (credentials.accessKeyId && credentials.secretAccessKey) {
        this.ssmClient = new SSMClient({
          region,
          credentials
        })
        this.isConfigured = true
        console.log('AWS Parameter Store configured successfully')
      } else {
        console.warn('AWS credentials not provided - using mock mode for development')
        this.isConfigured = false
      }
    } catch (error) {
      console.warn('Failed to initialize AWS Parameter Store:', error)
      this.isConfigured = false
    }
  }

  /**
   * Get a single parameter from AWS Parameter Store
   */
  async getParameter(name: string, withDecryption: boolean = true): Promise<string | null> {
    if (!this.isConfigured || !this.ssmClient) {
      console.warn(`Parameter Store not configured - cannot fetch parameter: ${name}`)
      return null
    }

    try {
      const command = new GetParameterCommand({
        Name: name,
        WithDecryption: withDecryption
      })

      const response = await this.ssmClient.send(command)
      return response.Parameter?.Value || null
    } catch (error) {
      console.error(`Error fetching parameter ${name}:`, error)
      return null
    }
  }

  /**
   * Get multiple parameters from AWS Parameter Store
   */
  async getParameters(names: string[], withDecryption: boolean = true): Promise<Record<string, string>> {
    if (!this.isConfigured || !this.ssmClient) {
      console.warn('Parameter Store not configured - cannot fetch parameters:', names)
      return {}
    }

    try {
      const command = new GetParametersCommand({
        Names: names,
        WithDecryption: withDecryption
      })

      const response = await this.ssmClient.send(command)
      const parameters: Record<string, string> = {}

      response.Parameters?.forEach(param => {
        if (param.Name && param.Value) {
          parameters[param.Name] = param.Value
        }
      })

      return parameters
    } catch (error) {
      console.error('Error fetching parameters:', error)
      return {}
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
        console.warn('Failed to get credentials from serverless function')
        return {
          clientId: null,
          clientSecret: null
        }
      }
    }

    if (!this.isConfigured) {
      console.warn('AWS Parameter Store not configured - returning null credentials (demo mode)')
      return {
        clientId: null,
        clientSecret: null
      }
    }

    const parameterNames = [
      config.aws.parameterNames.twitchClientId,
      config.aws.parameterNames.twitchClientSecret
    ]

    const parameters = await this.getParameters(parameterNames)

    return {
      clientId: parameters[config.aws.parameterNames.twitchClientId] || null,
      clientSecret: parameters[config.aws.parameterNames.twitchClientSecret] || null
    }
  }
}

// Export singleton instance
export const parameterStore = new ParameterStoreService()
export default ParameterStoreService
