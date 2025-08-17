import { useState, useEffect } from 'react'
import Scene3D from './components/Scene3D'
import TwitchChat from './components/TwitchChat'
import StreamerOverlay from './components/StreamerOverlay'
import GameArea from './components/GameArea'
import CameraArea from './components/CameraArea'
import TwitchLogin from './components/TwitchLogin'
import { twitchUserOAuth } from './services/twitchUserOAuth'
import config from './config'
import './App.css'

function App() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isCheckingLogin, setIsCheckingLogin] = useState(true)
  
  // Check login status on app load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Handle OAuth redirect first
        const redirectHandled = await twitchUserOAuth.handleOAuthRedirect()
        
        if (redirectHandled) {
          console.log('✅ OAuth redirect handled successfully')
          setShowLoginDialog(false)
          setIsCheckingLogin(false)
          return
        }

        // Check if already logged in
        const isLoggedIn = await twitchUserOAuth.isLoggedIn()
        
        if (isLoggedIn) {
          console.log('✅ Already logged in as broadcaster')
          setShowLoginDialog(false)
        } else {
          console.log('ℹ️ Not logged in - showing login option')
          setShowLoginDialog(true)
        }
      } catch (error) {
        console.error('Error checking login status:', error)
        setShowLoginDialog(true)
      } finally {
        setIsCheckingLogin(false)
      }
    }

    checkLoginStatus()
  }, [])
  
  const handleLoginSuccess = () => {
    setShowLoginDialog(false)
    console.log('🎉 Login successful - broadcaster permissions enabled')
  }

  const handleSkipLogin = () => {
    setShowLoginDialog(false)
    console.log('⏭️ Login skipped - using app-only permissions')
  }

  if (isCheckingLogin) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner">🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Video Background */}
      <div className="background-3d">
        <Scene3D />
      </div>

      {/* Streamer UI Overlay */}
      <StreamerOverlay username={config.twitchUsername} />

      {/* Game Area */}
      <GameArea />

      {/* Twitch Chat */}
      <TwitchChat channel={config.twitchUsername} />

      {/* Camera Area */}
      <CameraArea />

      {/* Broadcaster Login Dialog */}
      {showLoginDialog && (
        <TwitchLogin 
          onLoginSuccess={handleLoginSuccess}
          onSkipLogin={handleSkipLogin}
        />
      )}
    </div>
  )
}

export default App
