/**
 * Streamer Theme Configuration
 * 
 * Quick Setup:
 * 1. Change 'twitchUsername' to your actual Twitch channel name
 * 2. Update social media handles in the 'social' section
 * 3. For real Twitch API data, follow the setup guide in SETUP.md
 * 
 * Demo Mode:
 * - The app will show demo data if AWS Parameter Store is not configured
 * - This is perfect for testing and development
 * 
 * Production Setup:
 * - Set up AWS Parameter Store with your Twitch credentials
 * - Follow the complete guide in SETUP.md
 */

// Configuration file for the Streamer Theme application
export const config = {
  // Your Twitch channel name (without the @)
  // Change this to your actual Twitch username
  twitchUsername: 'Jaebae66',
  
  // AWS Parameter Store configuration
  aws: {
    region: 'ap-southeast-2', // Sydney region
    parameterNames: {
      twitchClientId: '/twitch/client-id',
      twitchClientSecret: '/twitch/client-secret'
      // No access token needed - we generate fresh tokens automatically!
    }
  },
  
  // UI Configuration
  ui: {
    refreshInterval: 30000, // How often to refresh stream data (milliseconds)
    chatMaxMessages: 100,   // Maximum chat messages to display
    showProfileImage: true, // Show streamer profile image
    enableAnimations: true  // Enable UI animations
  },
  
  // Social media links (update with your actual handles)
  social: {
    twitter: 'YourTwitter',
    discord: 'Your Discord Server',
    youtube: 'YourYouTube'
  },
  
  // Development mode settings
  development: {
    // Set to true to use demo data instead of trying to connect to AWS
    useDemoMode: true,
    demoData: {
      viewers: 42,
      followers: 1337,
      subscribers: 156,
      streamTitle: '🎮 Epic Gaming Stream - Demo Mode',
      gameName: 'Demo Game',
      isLive: true,
      recentFollower: 'DemoFollower99',
      recentSubscriber: 'CoolSubscriber42'
    }
  }
}

export default config
