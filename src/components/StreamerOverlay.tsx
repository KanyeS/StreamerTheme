import React, { useState, useEffect } from 'react'
import { twitchApi } from '../services/twitchApi'
import config from '../config'
import './StreamerOverlay.css'

interface StreamerStats {
  viewers: number
  followers: number
  subscribers: number
  uptime: string
  isLive: boolean
  streamTitle: string
  gameName: string
  streamerName: string
  profileImageUrl: string
  recentFollower: string | null
  recentSubscriber: string | null
}

interface StreamerOverlayProps {
  username?: string
}

const StreamerOverlay: React.FC<StreamerOverlayProps> = ({ username = 'your_channel_name' }) => {
  const [stats, setStats] = useState<StreamerStats>({
    viewers: 0,
    followers: 0,
    subscribers: 0,
    uptime: '00:00:00',
    isLive: false,
    streamTitle: 'Loading...',
    gameName: '',
    streamerName: username,
    profileImageUrl: '',
    recentFollower: null,
    recentSubscriber: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streamStartTime, setStreamStartTime] = useState<Date | null>(null)

  // Fetch initial stream data
  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const streamStats = await twitchApi.getStreamStats(username)
        
        setStats({
          viewers: streamStats.viewerCount,
          followers: streamStats.followerCount,
          subscribers: streamStats.subscriberCount,
          uptime: twitchApi.calculateUptime(streamStats.startTime),
          isLive: streamStats.isLive,
          streamTitle: streamStats.streamTitle || 'Stream Offline',
          gameName: streamStats.gameName,
          streamerName: streamStats.userDisplayName,
          profileImageUrl: streamStats.profileImageUrl,
          recentFollower: streamStats.recentFollower,
          recentSubscriber: streamStats.recentSubscriber
        })
        
        setStreamStartTime(streamStats.startTime)
      } catch (err) {
        console.error('Error fetching stream data:', err)
        setError('AWS Parameter Store not configured')
        // Fallback to demo data if API fails
        setStats(prev => ({
          ...prev,
          streamTitle: '🎮 Demo Mode - Configure AWS Parameter Store for real data',
          gameName: 'Setup Required',
          isLive: false,
          viewers: 42,
          followers: 1337,
          subscribers: 156,
          recentFollower: 'DemoFollower',
          recentSubscriber: 'DemoSubscriber'
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchStreamData()
  }, [username])

  // Update uptime every second
  useEffect(() => {
    const timer = setInterval(() => {
      // Update uptime if stream is live
      if (streamStartTime) {
        setStats(prev => ({
          ...prev,
          uptime: twitchApi.calculateUptime(streamStartTime)
        }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [streamStartTime])

  // Periodically refresh stream data
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const streamStats = await twitchApi.getStreamStats(username)
        
        setStats(prev => ({
          ...prev,
          viewers: streamStats.viewerCount,
          followers: streamStats.followerCount,
          subscribers: streamStats.subscriberCount,
          isLive: streamStats.isLive,
          streamTitle: streamStats.streamTitle || 'Stream Offline',
          gameName: streamStats.gameName,
          recentFollower: streamStats.recentFollower,
          recentSubscriber: streamStats.recentSubscriber
        }))
        
        setStreamStartTime(streamStats.startTime)
      } catch (err) {
        console.error('Error refreshing stream data:', err)
      }
    }, config.ui.refreshInterval) // Use config refresh interval

    return () => clearInterval(refreshInterval)
  }, [username])

  return (
    <div className="streamer-overlay">
      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">🔄</div>
          <span>Loading stream data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-overlay">
          <div className="error-message">⚠️ {error}</div>
          <div className="error-subtitle">Using demo mode</div>
        </div>
      )}

      {/* Bottom Bar with Social Links */}
      <div className="bottom-bar">
        <div className="social-links">
          <div className="social-item">
            <span>🐦 @{config.social.twitter}</span>
          </div>
          <div className="social-item">
            <span>📺 twitch.tv/{username}</span>
          </div>
          <div className="social-item">
            <span>💬 Discord: {config.social.discord}</span>
          </div>
        </div>
      </div>

      {/* Notification Area */}
      <div className="notification-area">
        {stats.isLive && (
          <div className="live-notification">
            🎉 Thanks for watching the stream!
          </div>
        )}
      </div>
    </div>
  )
}

export default StreamerOverlay
