# Broadcaster Authorization Setup Guide

## 🎯 What This Gives You

With broadcaster authorization, you'll get:

- ✅ **Accurate subscriber count**
- ✅ **Recent subscriber names**
- ✅ **Enhanced follower data**
- ✅ **Full broadcaster permissions**

## 🔧 Setup Steps

### 1. Update Your Twitch Application Settings

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click on your existing application
3. Click "Manage"
4. In **OAuth Redirect URLs**, add:
   ```
   https://localhost:3004
   ```
   (Or whatever port your dev server is running on)
5. Click "Save"

### 2. Test the Login Flow

1. Refresh your streamer overlay page
2. You'll see a login dialog asking for broadcaster permissions
3. Click "🎮 Login with Twitch"
4. You'll be redirected to Twitch to authorize
5. After authorization, you'll be redirected back with full permissions

### 3. Production Setup

For production (like OBS), you'll need to:

1. Add your production URL to OAuth Redirect URLs
2. Update the redirect URI in the code if needed

## 🔄 How It Works

### Login Flow:

1. **Click Login** → Redirects to Twitch
2. **Authorize on Twitch** → You grant permissions to your own app
3. **Redirect Back** → App receives authorization code
4. **Exchange Code** → App gets user access token with full permissions
5. **Store Token** → Saved in browser localStorage
6. **Use Token** → All API calls now have broadcaster permissions

### Token Management:

- **Automatic Refresh** → Tokens are refreshed before they expire
- **Persistent Login** → You stay logged in across browser sessions
- **Secure Storage** → Tokens stored in localStorage (for production, use more secure storage)

## 🎛️ Control Options

### Skip Login:

- If you don't want to log in, just click outside the dialog
- The app will continue working with limited permissions (no subscriber data)

### Logout:

- Once logged in, you'll see a logout button in the top right
- Click it to return to app-only permissions

### Auto-Login:

- Once you've logged in, the app remembers your authorization
- Future visits will automatically use your broadcaster permissions

## 🔒 Security Notes

### What Permissions You're Granting:

- **user:read:email** - Basic profile access
- **channel:read:subscriptions** - View your subscriber data
- **channel:read:follows** - Enhanced follower data
- **moderator:read:followers** - Read follower information
- **channel:manage:broadcast** - Manage broadcast settings

### Data Storage:

- Tokens are stored in your browser's localStorage
- For production use, consider more secure token storage
- Tokens can be revoked anytime from your Twitch settings

## 🎮 Production Deployment

When you deploy this to a real domain:

1. **Update OAuth Redirect URL** in Twitch app settings:

   ```
   https://your-streaming-domain.com
   ```

2. **Update Redirect URI** in code if needed (it auto-detects by default)

3. **Consider Secure Token Storage** for production:
   - HTTP-only cookies
   - Encrypted storage
   - Server-side token management

## 🔧 Troubleshooting

### "OAuth Error" Message:

- Check that your redirect URL matches exactly in Twitch settings
- Make sure you're using HTTPS (required for OAuth)

### Token Expired:

- Tokens auto-refresh, but if there's an issue, just log out and log back in

### Still Getting 401 Errors:

- Make sure you've completed the login flow
- Check browser console for detailed error messages
- Verify the app has the correct scopes

## 🎯 Testing

You can test both modes:

1. **Without Login** → Limited permissions, subscriber count shows 0
2. **With Login** → Full permissions, real subscriber data

This gives you the flexibility to run in either mode depending on your needs!
