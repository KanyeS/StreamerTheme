import axios, { type AxiosInstance } from 'axios'
import { parameterStore } from './parameterStore'
import { twitchOAuth } from './twitchOAuth'
import { twitchUserOAuth } from './twitchUserOAuth'

export interface TwitchStreamData {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_id: string
  game_name: string
  type: string
  title: string
  viewer_count: number
  started_at: string
  language: string
  thumbnail_url: string
  tag_ids: string[]
  is_mature: boolean
}

export interface TwitchUserData {
  id: string
  login: string
  display_name: string
  type: string
  broadcaster_type: string
  description: string
  profile_image_url: string
  offline_image_url: string
  view_count: number
  created_at: string
}

export interface TwitchFollowersData {
  total: number
  data: Array<{
    from_id: string
    from_login: string
    from_name: string
    to_id: string
    to_login: string
    to_name: string
    followed_at: string
  }>
}

class TwitchApiService {
  private apiClient: AxiosInstance
  private clientId: string | null = null
  private accessToken: string | null = null
  private initialized = false

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api.twitch.tv/helix',
      timeout: 10000
    })
  }

  /**
   * Initialize the service with credentials from AWS Parameter Store
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true

    try {
      const credentials = await parameterStore.getTwitchCredentials()
      
      if (!credentials.clientId) {
        console.error('Missing Twitch Client ID in Parameter Store')
        return false
      }

      this.clientId = credentials.clientId

      // Try to use user token first (broadcaster permissions)
      const userToken = await twitchUserOAuth.getValidUserToken()
      
      if (userToken) {
        console.log('🔑 Using broadcaster token - full permissions enabled')
        this.accessToken = userToken
      } else {
        // Fall back to app access token (limited permissions)
        console.log('🤖 Using app token - limited permissions (no subscriber data)')
        const appToken = await twitchOAuth.getValidAccessToken()
        
        if (!appToken) {
          console.error('Failed to obtain valid Twitch access token')
          return false
        }
        
        this.accessToken = appToken
      }

      // Set default headers
      this.apiClient.defaults.headers.common['Client-ID'] = this.clientId
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`

      this.initialized = true
      console.log('Twitch API service initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Twitch API service:', error)
      return false
    }
  }

  /**
   * Make an API call that's expected to fail with 401 (for subscriber endpoints)
   */
  private async makeApiCallNoRetry<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    if (!this.initialized) {
      const initSuccess = await this.initialize()
      if (!initSuccess) return null
    }

    try {
      const response = await this.apiClient.get(endpoint, { params })
      return response.data
    } catch (error: any) {
      // Don't retry on subscriber endpoints - they require different permissions
      console.info(`API call to ${endpoint} failed (expected for subscriber endpoints with client credentials)`)
      return null
    }
  }

  /**
   * Make an API call with automatic retry on 401 errors
   */
  private async makeApiCall<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    if (!this.initialized) {
      const initSuccess = await this.initialize()
      if (!initSuccess) return null
    }

    try {
      const response = await this.apiClient.get(endpoint, { params })
      return response.data
    } catch (error: any) {
      // If we get a 401, try to refresh the token and retry once
      if (error.response?.status === 401) {
        console.log('Got 401 error, refreshing token and retrying...')
        
        // Force re-initialization with fresh token
        this.initialized = false
        const initSuccess = await this.initialize()
        
        if (initSuccess) {
          try {
            const retryResponse = await this.apiClient.get(endpoint, { params })
            return retryResponse.data
          } catch (retryError) {
            console.error('Retry after token refresh failed:', retryError)
            return null
          }
        }
      }
      
      console.error(`Error making API call to ${endpoint}:`, error)
      return null
    }
  }

  /**
   * Get stream information for a specific user
   */
  async getStreamData(username: string): Promise<TwitchStreamData | null> {
    const response = await this.makeApiCall<{data: TwitchStreamData[]}>('/streams', {
      user_login: username
    })

    if (!response) return null
    
    const streams = response.data
    return streams.length > 0 ? streams[0] : null
  }

  /**
   * Get user information
   */
  async getUserData(username: string): Promise<TwitchUserData | null> {
    const response = await this.makeApiCall<{data: TwitchUserData[]}>('/users', {
      login: username
    })

    if (!response) return null
    
    const users = response.data
    return users.length > 0 ? users[0] : null
  }

  /**
   * Get follower count for a user (using new Helix API)
   */
  async getFollowerCount(userId: string): Promise<number> {
    const response = await this.makeApiCall<{total: number, data: any[]}>('/channels/followers', {
      broadcaster_id: userId,
      first: 1 // We only need the total count
    })

    return response?.total || 0
  }

  /**
   * Get recent followers
   */
  async getRecentFollowers(userId: string, count: number = 5): Promise<Array<{
    user_id: string
    user_login: string
    user_name: string
    followed_at: string
  }>> {
    const response = await this.makeApiCall<{data: any[]}>('/channels/followers', {
      broadcaster_id: userId,
      first: count
    })

    return response?.data || []
  }

  /**
   * Get subscriber count (requires broadcaster or moderator token)
   */
  async getSubscriberCount(userId: string): Promise<number> {
    // Check if we have user token (broadcaster permissions)
    const userToken = await twitchUserOAuth.getValidUserToken()
    
    if (userToken) {
      // Use regular API call with user token
      console.info('📊 Getting subscriber count with broadcaster permissions')
      const response = await this.makeApiCall<{total: number, data: any[]}>('/subscriptions', {
        broadcaster_id: userId,
        first: 1
      })
      return response?.total || 0
    } else {
      // Use no-retry call for app token (expected to fail)
      console.info('Attempting to get subscriber count (may fail with client credentials - this is normal)')
      const response = await this.makeApiCallNoRetry<{total: number, data: any[]}>('/subscriptions', {
        broadcaster_id: userId,
        first: 1
      })

      if (!response) {
        console.info('✅ Subscriber count not available with client credentials (this is expected)')
        return 0
      }

      return response?.total || 0
    }
  }

  /**
   * Get recent subscribers (requires broadcaster or moderator token)
   */
  async getRecentSubscribers(userId: string, count: number = 5): Promise<Array<{
    user_id: string
    user_login: string
    user_name: string
    tier: string
    is_gift: boolean
  }>> {
    // Check if we have user token (broadcaster permissions)
    const userToken = await twitchUserOAuth.getValidUserToken()
    
    if (userToken) {
      // Use regular API call with user token
      console.info('📊 Getting recent subscribers with broadcaster permissions')
      const response = await this.makeApiCall<{data: any[]}>('/subscriptions', {
        broadcaster_id: userId,
        first: count
      })
      return response?.data || []
    } else {
      // Use no-retry call for app token (expected to fail)
      console.info('Attempting to get recent subscribers (may fail with client credentials - this is normal)')
      const response = await this.makeApiCallNoRetry<{data: any[]}>('/subscriptions', {
        broadcaster_id: userId,
        first: count
      })

      if (!response) {
        console.info('✅ Recent subscribers not available with client credentials (this is expected)')
        return []
      }

      return response?.data || []
    }
  }

  /**
   * Get comprehensive stream stats
   */
  async getStreamStats(username: string): Promise<{
    isLive: boolean
    viewerCount: number
    followerCount: number
    subscriberCount: number
    streamTitle: string
    gameName: string
    startTime: Date | null
    thumbnailUrl: string
    userDisplayName: string
    profileImageUrl: string
    recentFollower: string | null
    recentSubscriber: string | null
  }> {
    const defaultStats = {
      isLive: false,
      viewerCount: 0,
      followerCount: 0,
      subscriberCount: 0,
      streamTitle: '',
      gameName: '',
      startTime: null,
      thumbnailUrl: '',
      userDisplayName: username,
      profileImageUrl: '',
      recentFollower: null,
      recentSubscriber: null
    }

    try {
      // Get user data first
      const userData = await this.getUserData(username)
      if (!userData) return defaultStats

      // Get all data in parallel for better performance
      const [streamData, followerCount, subscriberCount, recentFollowers, recentSubscribers] = await Promise.all([
        this.getStreamData(username),
        this.getFollowerCount(userData.id),
        this.getSubscriberCount(userData.id),
        this.getRecentFollowers(userData.id, 1),
        this.getRecentSubscribers(userData.id, 1)
      ])

      return {
        isLive: !!streamData,
        viewerCount: streamData?.viewer_count || 0,
        followerCount,
        subscriberCount,
        streamTitle: streamData?.title || '',
        gameName: streamData?.game_name || '',
        startTime: streamData ? new Date(streamData.started_at) : null,
        thumbnailUrl: streamData?.thumbnail_url || '',
        userDisplayName: userData.display_name,
        profileImageUrl: userData.profile_image_url,
        recentFollower: recentFollowers.length > 0 ? recentFollowers[0].user_name : null,
        recentSubscriber: recentSubscribers.length > 0 ? recentSubscribers[0].user_name : null
      }
    } catch (error) {
      console.error('Error fetching stream stats:', error)
      return defaultStats
    }
  }

  /**
   * Calculate stream uptime
   */
  calculateUptime(startTime: Date | null): string {
    if (!startTime) return '00:00:00'

    const now = new Date()
    const diff = now.getTime() - startTime.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

// Export singleton instance
export const twitchApi = new TwitchApiService()
export default TwitchApiService
