import React, { useState, useEffect } from 'react'
import { twitchUserOAuth } from '../services/twitchUserOAuth'
import './TwitchLogin.css'

interface TwitchLoginProps {
  onLoginSuccess: () => void
  onSkipLogin?: () => void
}

const TwitchLogin: React.FC<TwitchLoginProps> = ({ onLoginSuccess, onSkipLogin }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await twitchUserOAuth.isLoggedIn()
        setIsLoggedIn(loggedIn)
        
        if (loggedIn) {
          onLoginSuccess()
        }
      } catch (err) {
        console.error('Error checking login status:', err)
      }
    }

    // Handle OAuth redirect on page load
    const handleRedirect = async () => {
      const success = await twitchUserOAuth.handleOAuthRedirect()
      if (success) {
        setIsLoggedIn(true)
        onLoginSuccess()
      }
    }

    handleRedirect().then(() => checkLoginStatus())
  }, [onLoginSuccess])

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const authUrl = await twitchUserOAuth.getAuthorizationUrl()
      
      // Redirect to Twitch authorization
      window.location.href = authUrl
    } catch (err) {
      setError('Failed to initiate login. Please check your AWS Parameter Store configuration.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    twitchUserOAuth.clearTokens()
    setIsLoggedIn(false)
  }

  if (isLoggedIn) {
    return (
      <div className="twitch-login logged-in">
        <div className="login-status">
          <span className="status-indicator">✅ Logged in as Broadcaster</span>
          <span className="permissions-note">Full access to subscriber data enabled</span>
        </div>
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="twitch-login">
      <div className="login-prompt">
        <h3>🔑 Broadcaster Login Required</h3>
        <p>To access subscriber data, you need to log in as the broadcaster.</p>
        
        <div className="permissions-info">
          <h4>This will enable:</h4>
          <ul>
            <li>✅ Accurate subscriber count</li>
            <li>✅ Recent subscriber names</li>
            <li>✅ Enhanced follower data</li>
            <li>✅ Full broadcaster permissions</li>
          </ul>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <button 
          className="login-btn"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Redirecting...' : '🎮 Login with Twitch'}
        </button>

        <button 
          className="skip-btn"
          onClick={() => onSkipLogin?.()}
        >
          ⏭️ Skip Login (Use App-Only Mode)
        </button>

        <div className="fallback-note">
          <p>
            <strong>App-Only Mode:</strong><br />
            Works with follower count and stream data.
            Subscriber data will show as 0.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TwitchLogin
