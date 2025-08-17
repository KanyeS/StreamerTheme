# Twitch API Setup and Permissions Guide

## Overview

Your streamer theme now supports enhanced Twitch integration with automatic OAuth token generation, follower tracking, subscriber data, and recent activity displays.

## Required Parameter Store Values

Add these to AWS Parameter Store in the **ap-southeast-2** region:

1. **`/twitch/client-id`** - Your Twitch application's Client ID
2. **`/twitch/client-secret`** - Your Twitch application's Client Secret (SecureString recommended)

## Twitch Application Setup

### 1. Create Twitch Application

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill in:
   - **Name**: Your app name (e.g., "MyStream Overlay")
   - **OAuth Redirect URLs**: `http://localhost:3000` (for testing)
   - **Category**: Application Integration

### 2. Required Scopes

The application uses **Client Credentials** flow with these scopes:

- `user:read:email` - Basic user information
- `channel:read:subscriptions` - Subscriber count and recent subscribers
- `moderation:read` - Enhanced channel access

## API Features and Limitations

### ✅ Available with Client Credentials (App Access Token):

- **Follower Count** - Total number of followers
- **Recent Followers** - Latest followers (with their usernames)
- **Stream Data** - Live status, viewer count, game, title
- **User Profile** - Display name, profile image

### ⚠️ Limited Access (Requires User Authorization):

- **Subscriber Count** - May return 0 without broadcaster/moderator permissions
- **Recent Subscribers** - May be empty without special permissions

### 🔄 Automatic Features:

- **Fresh Tokens** - New access token generated every session
- **Error Recovery** - Automatic retry on 401 errors
- **Demo Mode** - Graceful fallback if AWS/Twitch unavailable

## Current Display Features

### Main Stats Panel:

- 👥 Current Viewers
- ❤️ Total Followers
- ⭐ Total Subscribers
- ⏰ Stream Uptime

### Recent Activity Panel:

- 🎉 Latest Follower
- ⭐ Latest Subscriber

## AWS Permissions Required

Your AWS credentials only need **READ** access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ssm:GetParameter",
      "Resource": [
        "arn:aws:ssm:ap-southeast-2:*:parameter/twitch/client-id",
        "arn:aws:ssm:ap-southeast-2:*:parameter/twitch/client-secret"
      ]
    }
  ]
}
```

## Troubleshooting

### No Subscriber Data?

This is normal! Subscriber endpoints require broadcaster or moderator permissions. The app will show 0 subscribers and no recent subscriber activity unless you're using a user access token with the right permissions.

### Follower Count Seems Wrong?

The new Twitch API has different rate limits and caching behavior. The count should be accurate but may not update immediately.

### Demo Mode Showing?

Check that:

1. AWS credentials are configured correctly
2. Parameter Store values exist in ap-southeast-2 region
3. Twitch Client ID and Secret are valid
4. Browser console for any error messages

## Next Steps for Enhanced Features

To get subscriber data, you'd need to implement user OAuth flow instead of client credentials, but this requires:

- User login/authorization flow
- Storing refresh tokens
- More complex permission management

The current setup is perfect for public streaming overlays with follower tracking and stream stats!
