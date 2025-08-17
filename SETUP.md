# Streamer Theme Setup Guide

This guide will help you set up your Twitch API integration with AWS Parameter Store for your streamer overlay.

## Prerequisites

1. **Twitch Developer Account**: You need a Twitch account and access to the Twitch Developer Console
2. **AWS Account**: You need an AWS account with access to Parameter Store (SSM)
3. **Node.js**: Version 16 or higher installed on your machine

## Step 1: Create a Twitch Application

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill out the form:
   - **Name**: Your application name (e.g., "My Stream Overlay")
   - **OAuth Redirect URLs**: `https://localhost:3000` (see solutions below for HTTPS setup)
   - **Category**: Choose "Application Integration"
4. Click "Create"
5. Note down your **Client ID**

### 🔧 HTTPS Localhost Solutions

Since Twitch requires HTTPS, you have several options:

**Option A: Use a development tunnel (Recommended)**

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. In another terminal: `ngrok http 5176` (or whatever port your app uses)
4. Use the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) as your redirect URL

**Option B: Use localhost with HTTPS**

1. Use `https://localhost:3000` as redirect URL
2. Most browsers will accept self-signed certificates for localhost
3. When testing, click "Advanced" → "Proceed to localhost (unsafe)" if warned

**Option B2: Create a Self-Signed Certificate (Simple)**

If you want a proper local HTTPS setup:

1. **Create a self-signed certificate** (Quick option - use the helper script):

```bash
# On Windows (Git Bash or PowerShell)
./setup-https.bat

# On macOS/Linux
./setup-https.sh
```

Or manually:

```bash
# Using OpenSSL (comes with Git Bash on Windows)
openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost-cert.pem -days 365 -nodes -subj "/CN=localhost"

# Or using PowerShell on Windows
New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My"
```

2. **Configure Vite for HTTPS** - Update your existing `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("./localhost-key.pem"),
      cert: fs.readFileSync("./localhost-cert.pem"),
    },
    port: 3000,
  },
});
```

3. **Start your dev server** - it will now run on `https://localhost:3000`
4. **Accept the certificate** in your browser (it's safe for localhost)
5. **Use `https://localhost:3000` in your Twitch app redirect URL**

**Option C: Use a custom domain (Production)**

1. Set up a domain with SSL certificate
2. Use your actual domain as the redirect URL
3. Deploy your app to that domain

**Option D: Alternative Token Generation**
For development, you can also use:

- Twitch CLI tool which handles HTTPS automatically
- Or simply generate tokens on the Twitch website directly without needing redirects

## Step 2: Generate Access Token

You'll need an access token to access the Twitch API. Here are several methods:

### Method A: Twitch Token Generator (Easiest)

1. Go to [Twitch Token Generator](https://twitchtokengenerator.com/)
2. This site handles HTTPS automatically
3. Select the scopes you need:
   - `user:read:email` (to read user information)
   - `channel:read:subscriptions` (if you want subscriber data)
   - `moderation:read` (if you want moderation data)
4. Generate the token and note it down

### Method B: Twitch CLI (Developer Tool)

1. Install [Twitch CLI](https://github.com/twitchdev/twitch-cli)
2. Run: `twitch token`
3. This automatically handles HTTPS and authentication

### Method C: Manual OAuth Flow (Advanced)

1. Use your Twitch app with proper HTTPS redirect URL
2. Follow the OAuth2 flow manually
3. Extract the access token from the callback

### Method D: Direct from Twitch Developer Console

1. In your Twitch Developer Console
2. Go to your application
3. Generate a token directly (may have limited scopes)

**Recommended**: Use Method A (Token Generator) for simplicity, or Method B (Twitch CLI) for a more developer-friendly approach.

### 💡 Important Note for This Project

For the **Streamer Theme overlay**, you actually don't need to worry about the OAuth redirect URL working perfectly during development because:

- The app reads stream data using the **Twitch Helix API** (not OAuth callbacks)
- You only need a **valid access token** (which you can get from the token generator)
- The redirect URL in your Twitch app is mainly for future OAuth flows
- **Bottom line**: Just use `https://localhost:3000` in your Twitch app, and get your token from the token generator site

This makes setup much simpler for streaming overlays!

**Important**: Keep your access token secure and never commit it to version control.

## Quick HTTPS Setup with ngrok (Recommended for Development)

If you want to test the full OAuth flow during development:

1. **Install ngrok** (if you don't have it):

```bash
npm install -g ngrok
# or download from https://ngrok.com/
```

2. **Start your development server**:

```bash
npm run dev
```

3. **In a new terminal, start ngrok**:

```bash
ngrok http 5176
# Use whatever port your dev server is running on
```

4. **Copy the HTTPS URL** from ngrok output (e.g., `https://abc123.ngrok.io`)

5. **Update your Twitch app** redirect URL to use the ngrok HTTPS URL

This gives you a secure HTTPS tunnel to your local development server!

## Step 3: Set up AWS Parameter Store

1. Log into your AWS Console
2. Navigate to **Systems Manager** → **Parameter Store**
3. Create the following parameters:

### Parameter 1: Twitch Client ID

- **Name**: `/twitch/client-id`
- **Type**: `String`
- **Value**: Your Twitch Client ID from Step 1

### Parameter 2: Twitch Access Token

- **Name**: `/twitch/access-token`
- **Type**: `SecureString` (recommended for security)
- **Value**: Your Twitch Access Token from Step 2

## Step 4: Configure AWS Credentials

You have several options for AWS credentials:

### 💰 Cost Note

**Good news**: IAM roles, users, and access keys are completely **FREE** in AWS! Parameter Store is also free for standard parameters (up to 10,000). Your total cost for this setup will be $0.00-$0.01 per month.

### 🔑 How to Create AWS Access Keys

**Step-by-Step Guide:**

1. **Log into AWS Console**:

   - Go to [AWS Console](https://aws.amazon.com/console/)
   - Sign in with your AWS account

2. **Navigate to IAM**:

   - Search for "IAM" in the top search bar
   - Click on "IAM" (Identity and Access Management)

3. **Create a New User** (recommended for security):

   - Click "Users" in the left sidebar
   - Click "Create user"
   - **Username**: `streamer-theme-user` (or any name you prefer)
   - **Access type**: Select "Programmatic access"
   - Click "Next"

4. **Set Permissions**:

   - Click "Attach policies directly"
   - Search for and select: `AmazonSSMReadOnlyAccess`
   - Or create a custom policy (see below for minimal permissions)
   - Click "Next"

5. **Review and Create**:

   - Review the settings
   - Click "Create user"

6. **Save Your Keys** (IMPORTANT!):
   - **Access Key ID**: Copy this (it starts with "AKIA...")
   - **Secret Access Key**: Copy this (you can only see it once!)
   - Download the CSV file as backup
   - Store these securely - never share them!

### 🛡️ Minimal Permissions Policy (Optional - More Secure)

Instead of `AmazonSSMReadOnlyAccess`, you can create a custom policy with minimal permissions:

1. In IAM, go to "Policies" → "Create policy"
2. Choose "JSON" tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters"],
      "Resource": ["arn:aws:ssm:*:*:parameter/twitch/*"]
    }
  ]
}
```

3. Name it `StreamerThemeParameterAccess`
4. Attach this policy to your user instead

### Option A: AWS CLI (Recommended for development)

1. **Install AWS CLI**:

   - Download from [AWS CLI](https://aws.amazon.com/cli/)
   - Or use: `winget install Amazon.AWSCLI` (Windows)

2. **Configure with your keys**:

```bash
aws configure
```

When prompted, enter:

- **AWS Access Key ID**: Your access key from above
- **AWS Secret Access Key**: Your secret key from above
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

3. **Test the setup**:

```bash
aws sts get-caller-identity
```

This should show your AWS account info if configured correctly.

The application will automatically use these credentials!

### Option B: Environment Variables

If you prefer to use environment variables instead of AWS CLI:

1. **Open your `.env.local` file** (created earlier)
2. **Add your AWS credentials**:

```bash
# Uncomment and fill in your actual AWS credentials
VITE_AWS_ACCESS_KEY_ID=AKIA1234567890EXAMPLE
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_AWS_REGION=us-east-1
```

3. **Save the file** and restart your dev server:

```bash
npm run dev
```

**Security Note**: Environment variables are visible in your browser's developer tools, so only use this for development!

### Option C: IAM Roles (Recommended for production)

If deploying to AWS (EC2, Lambda, etc.), use IAM roles instead of hardcoded credentials.

### 🧪 Testing Your AWS Setup

After configuring your credentials, test them:

**Option A - Using AWS CLI:**

```bash
# Test basic access
aws sts get-caller-identity

# Test Parameter Store access (after creating parameters)
aws ssm get-parameter --name "/twitch/client-id"
```

**Option B - In your app:**

1. Start your dev server: `npm run dev`
2. Open browser console (F12)
3. Look for AWS-related log messages
4. Should see: "AWS Parameter Store configured successfully"

## Step 5: Configure the Application

1. Open `src/config.ts`
2. Update the configuration:

```typescript
export const config = {
  // Your actual Twitch channel name
  twitchUsername: "your_actual_username",

  aws: {
    region: "us-east-1", // Change to your preferred AWS region
    parameterNames: {
      twitchClientId: "/twitch/client-id",
      twitchAccessToken: "/twitch/access-token",
    },
  },

  social: {
    twitter: "YourActualTwitter",
    discord: "Your Actual Discord Server",
    youtube: "YourActualYouTube",
  },
};
```

## Step 6: Test the Setup

1. Start the development server:

```bash
npm run dev
```

2. Open your browser to `http://localhost:5175`
3. Check the browser console for any errors
4. The overlay should show:
   - ✅ Real follower count
   - ✅ Live viewer count (if streaming)
   - ✅ Stream title and game
   - ✅ Live/offline status

## Troubleshooting

### Common Issues

**1. "Failed to load stream data" error**

- Check your AWS credentials
- Verify parameter names in Parameter Store
- Ensure your AWS region is correct in config

**2. "CORS errors"**

- This is normal in development; the Twitch API is called from the backend
- If deploying, ensure your domain is added to Twitch app redirect URLs

**3. "Access token expired"**

- Twitch tokens expire; you'll need to regenerate them periodically
- Consider implementing automatic token refresh for production

**4. "Parameter not found" errors**

- Double-check parameter names in AWS Parameter Store
- Ensure they match the names in your config file

### AWS Permissions

Your AWS user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters"],
      "Resource": ["arn:aws:ssm:*:*:parameter/twitch/*"]
    }
  ]
}
```

## Production Deployment

For production deployment:

1. **Use IAM roles** instead of access keys
2. **Enable encryption** for Parameter Store values
3. **Set up token refresh** mechanism
4. **Configure proper CORS** on your domain
5. **Use environment-specific** parameter names

## Security Notes

- Never commit AWS credentials to version control
- Use SecureString type for sensitive parameters
- Regularly rotate your Twitch access tokens
- Use least-privilege IAM policies
- Consider using AWS Secrets Manager for production

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify all configuration values
3. Test AWS Parameter Store access manually
4. Ensure Twitch API credentials are valid

The application includes fallback demo data if the API fails, so you can still see the UI working even during setup.
