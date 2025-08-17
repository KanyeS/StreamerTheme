import React, { useState, useEffect, useRef } from 'react'
import { Client } from 'tmi.js'
import { twitchApi } from '../services/twitchApi'

interface ChatMessage {
  id: string
  username: string
  message: string
  color?: string
  timestamp: Date
  badges?: string[]
}

interface RecentActivity {
  recentFollower: string | null
  recentSubscriber: string | null
}

interface TwitchChatProps {
  channel?: string
}

const TwitchChat: React.FC<TwitchChatProps> = ({ channel: initialChannel = 'your_channel_name' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState(initialChannel)
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    recentFollower: null,
    recentSubscriber: null
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-connect when channel prop is provided
  useEffect(() => {
    if (initialChannel && initialChannel !== 'your_channel_name' && !isConnected) {
      connectToTwitch(initialChannel)
    }
  }, [initialChannel, isConnected])

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const stats = await twitchApi.getStreamStats(initialChannel)
        setRecentActivity({
          recentFollower: stats.recentFollower,
          recentSubscriber: stats.recentSubscriber
        })
      } catch (error) {
        console.error('Failed to fetch recent activity:', error)
      }
    }

    if (initialChannel && initialChannel !== 'your_channel_name') {
      fetchRecentActivity()
      // Refresh every 30 seconds
      const interval = setInterval(fetchRecentActivity, 30000)
      return () => clearInterval(interval)
    }
  }, [initialChannel])

  const connectToTwitch = async (channelName: string) => {
    if (!channelName.trim()) return

    try {
      const tmiClient = new Client({
        options: { debug: false },
        channels: [channelName.toLowerCase()]
      })

      tmiClient.on('message', (_, tags, message, self) => {
        if (self) return

        const newMessage: ChatMessage = {
          id: `${Date.now()}-${Math.random()}`,
          username: tags['display-name'] || tags.username || 'Anonymous',
          message: message,
          color: tags.color || '#ffffff',
          timestamp: new Date(),
          badges: tags.badges ? Object.keys(tags.badges) : []
        }

        setMessages(prev => {
          const updatedMessages = [...prev, newMessage]
          // Keep only the last 50 messages for performance
          return updatedMessages.slice(-50)
        })
      })

      tmiClient.on('connected', () => {
        setIsConnected(true)
        console.log('Connected to Twitch chat')
      })

      tmiClient.on('disconnected', () => {
        setIsConnected(false)
        console.log('Disconnected from Twitch chat')
      })

      await tmiClient.connect()
    } catch (error) {
      console.error('Failed to connect to Twitch:', error)
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getBadgeColor = (badge: string) => {
    const badgeColors: { [key: string]: string } = {
      'broadcaster': '#e74c3c',
      'moderator': '#00ad03',
      'subscriber': '#6441a5',
      'vip': '#e91e63',
      'premium': '#009688',
    }
    return badgeColors[badge] || '#95a5a6'
  }

  return (
    <div className="twitch-chat">
      <div className="chat-header" style={{
        padding: '15px 20px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
          💬 Twitch Chat
        </h3>
        <div className="connection-status">
          <div 
            className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#00ff88' : '#ff6b6b',
              display: 'inline-block',
              marginLeft: '8px',
              boxShadow: isConnected ? '0 0 8px #00ff88' : '0 0 8px #ff6b6b',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      {(recentActivity.recentFollower || recentActivity.recentSubscriber) && (
        <div style={{
          padding: '10px 15px', // Reduced padding
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '8px', // Reduced margin
            color: '#ffffff',
            fontSize: '12px', // Smaller font
            fontWeight: 'bold'
          }}>
            🎉 Recent Activity
          </div>
          
          {recentActivity.recentFollower && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 10px', // Reduced padding
              margin: '3px 0', // Reduced margin
              borderRadius: '6px', // Smaller radius
              background: 'linear-gradient(90deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1))',
              border: '1px solid rgba(255, 107, 107, 0.3)'
            }}>
              <div style={{ fontSize: '14px', marginRight: '8px' }}>❤️</div> {/* Smaller icon */}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#888', fontSize: '9px', textTransform: 'uppercase' }}>Latest Follower</div>
                <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }}>{recentActivity.recentFollower}</div>
              </div>
            </div>
          )}
          
          {recentActivity.recentSubscriber && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 10px', // Reduced padding
              margin: '3px 0', // Reduced margin
              borderRadius: '6px', // Smaller radius
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div style={{ fontSize: '14px', marginRight: '8px' }}>⭐</div> {/* Smaller icon */}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#888', fontSize: '9px', textTransform: 'uppercase' }}>Latest Subscriber</div>
                <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }}>{recentActivity.recentSubscriber}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        <div className="chat-connect" style={{ padding: '20px' }}>
          <input
            type="text"
            placeholder="Enter Twitch channel name"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && connectToTwitch(channel)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => connectToTwitch(channel)}
            disabled={!channel.trim()}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: channel.trim() ? 'pointer' : 'not-allowed',
              opacity: channel.trim() ? 1 : 0.5,
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Connect to Chat
          </button>
        </div>
      ) : (
        <>
          <div 
            ref={chatContainerRef}
            className="chat-messages"
            style={{
              height: (recentActivity.recentFollower || recentActivity.recentSubscriber) 
                ? 'calc(100% - 200px)' // Account for header (80px) + recent activity section (160px)
                : 'calc(100% - 80px)',  // Just header
              overflowY: 'auto',
              padding: '15px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '0 0 12px 12px'
            }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className="chat-message"
                style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#888',
                    marginRight: '8px'
                  }}>
                    {formatTimestamp(msg.timestamp)}
                  </span>
                  
                  {msg.badges && msg.badges.map((badge) => (
                    <span
                      key={badge}
                      style={{
                        fontSize: '8px',
                        padding: '1px 4px',
                        background: getBadgeColor(badge),
                        color: 'white',
                        borderRadius: '2px',
                        marginRight: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                  
                  <span style={{ 
                    fontWeight: 'bold',
                    color: msg.color || '#ffffff',
                    marginRight: '8px'
                  }}>
                    {msg.username}:
                  </span>
                </div>
                <div style={{ color: '#ffffff', wordWrap: 'break-word' }}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}

      <style>{`
        .twitch-chat::-webkit-scrollbar {
          width: 6px;
        }
        
        .twitch-chat::-webkit-scrollbar-track {
          background: #2d2d2d;
        }
        
        .twitch-chat::-webkit-scrollbar-thumb {
          background: #6441a5;
          border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
          background: #2d2d2d;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
          background: #6441a5;
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}

export default TwitchChat
