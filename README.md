# 🎮 Streamer Theme - Magical Forest Overlay

A beautiful React-based streaming overlay with a magical Ghibli-style forest background, real-time Twitch integration, and animated elements perfect for streamers.

## ✨ Features

- **🌲 Magical Forest Background**: Beautiful 3D Ghibli-style woodland scene with animated trees, fireflies, and floating leaves
- **🎮 Game Display Area**: Central white area with animated flower border for showcasing gameplay
- **📺 Real-time Twitch Integration**: Live viewer count, follower count, stream status, and chat
- **🔐 Secure Serverless Architecture**: Uses Vercel serverless functions for secure credential management
- **💬 Live Chat Overlay**: Real-time Twitch chat integration with user badges
- **📊 Stream Statistics**: Live viewer count, follower count, uptime, and stream information
- **🎨 Beautiful Animations**: Smooth CSS and WebGL animations throughout
- **📱 Responsive Design**: Works on desktop and mobile devices
- **☁️ Easy Deployment**: One-click deploy to Vercel with zero configuration

## 🚀 Quick Start

### 🏃‍♂️ **Instant Demo (No Setup Required)**

1. **Clone and Install**

```bash
git clone <your-repo-url>
cd StreamerTheme
npm install
```

2. **Start Development Server**

```bash
npm run dev
```

3. **Open in Browser**
   - Navigate to `http://localhost:5175` (or the port shown in terminal)
   - Your magical streaming overlay is ready with demo data!

### 🌐 **Deploy to Production (5 minutes)**

1. **Fork this repository** on GitHub

2. **Create Twitch App**
   - Go to [Twitch Developer Console](https://dev.twitch.tv/console)
   - Create a new application
   - Set redirect URLs to your domain (e.g., `https://yourapp.vercel.app`)
   - Note your Client ID and Client Secret

3. **Deploy to Vercel**
   - Connect your GitHub fork to [Vercel](https://vercel.com)
   - Add environment variables:
     - `TWITCH_CLIENT_ID=your_client_id`
     - `TWITCH_CLIENT_SECRET=your_client_secret`
   - Deploy! 🚀

4. **Configure Your Settings**
   - Edit `src/config.ts` with your Twitch username
   - Push changes to auto-deploy

## 🎯 Demo Mode vs Live Mode

**Demo Mode (Development)**

- ✅ Works immediately without any setup
- ✅ Shows sample data (viewers, followers, etc.)
- ✅ Perfect for testing and customization
- ✅ No credentials required

**Live Mode (Production)**

- ✅ Shows real Twitch stream data
- ✅ Secure serverless architecture
- ✅ OAuth user login support
- ✅ Real-time chat integration
- ✅ Automatic environment detection

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Three Fiber** - 3D graphics and animations
- **React Three Drei** - 3D utility components
- **Three.js** - Core 3D graphics library
- **tmi.js** - Twitch chat integration
- **Vercel Serverless Functions** - Secure API endpoints
- **CSS3** - Custom animations and styling

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Scene3D.tsx      # 3D forest background
│   ├── GameArea.tsx     # Game display area with flowers
│   ├── StreamerOverlay.tsx # Stream stats and info
│   ├── TwitchChat.tsx   # Live chat integration
│   └── TwitchLogin.tsx  # OAuth login component
├── services/            # API and external services
│   ├── twitchApi.ts     # Twitch API integration
│   ├── twitchOAuth.ts   # OAuth token management
│   ├── serverlessTwitchAuth.ts # Serverless API calls
│   └── parameterStore.ts # AWS fallback (dev only)
├── config.ts            # Application configuration
└── App.tsx              # Main application component

api/                     # Vercel serverless functions
├── twitch-auth.js       # App token endpoint
└── twitch-user-token.js # User OAuth endpoint
```

## 🔧 Configuration

### Basic Setup

Edit `src/config.ts`:

```typescript
export const config = {
  twitchUsername: "your_twitch_username", // ← Change this!
  social: {
    twitter: "your_twitter",
    discord: "your_discord", 
    youtube: "your_youtube",
  },
};
```

### Environment Variables (Production)

Set these in your Vercel dashboard:

```bash
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

## 🎨 Customization

### Modify the Forest Scene

Edit `src/components/Scene3D.tsx` to customize:

- Tree colors and positions
- Particle effects (fireflies)
- Camera angles and lighting

### Update Colors and Styling

Modify the CSS files in each component directory to change:

- Overlay transparency and colors
- Animation speeds and effects
- Layout and positioning

### Game Area Design

Customize `src/components/GameArea.tsx` to change:

- Background color/pattern
- Flower types and animations
- Border styling

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔐 Security & Architecture

### Serverless Security

- ✅ **Client secrets never exposed** to frontend
- ✅ **Automatic environment detection** (dev/prod)
- ✅ **CORS configured** for secure API access
- ✅ **OAuth token exchange** handled server-side
- ✅ **No hardcoded credentials** in code

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Data Source** | Demo data | Real Twitch API |
| **Authentication** | None required | Serverless OAuth |
| **API Calls** | Local mocks | Vercel functions |
| **Security** | Development only | Production secure |

## 🚀 Deployment Options

### Vercel (Recommended)
- ✅ Zero configuration
- ✅ Automatic serverless functions
- ✅ Environment variable management
- ✅ Custom domains
- ✅ SSL certificates

### Other Platforms
- **Netlify**: Manual serverless function setup required
- **AWS Amplify**: Additional configuration needed
- **Self-hosted**: Requires custom backend for OAuth

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide with screenshots
- **[TWITCH_API_GUIDE.md](./TWITCH_API_GUIDE.md)** - Twitch API integration details
- **[BROADCASTER_LOGIN_SETUP.md](./BROADCASTER_LOGIN_SETUP.md)** - OAuth setup guide

## 🎯 Use Cases

Perfect for:

- **Game Streamers** - Showcase gameplay with beautiful overlays
- **Just Chatting Streams** - Elegant background for talk shows
- **Creative Streams** - Magical atmosphere for art/music creation
- **Educational Content** - Professional-looking educational streams
- **Multi-platform** - Works with OBS, Streamlabs, XSplit

## 🛡️ Access Control

By default, anyone can use your deployed app. To restrict access:

1. **Whitelist users** in serverless functions
2. **Private Twitch app** (most restrictive)
3. **Domain restrictions** in Twitch app settings

See documentation for implementation details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both demo and live modes
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your streaming setup!

## 🙏 Acknowledgments

- **Studio Ghibli** - Inspiration for the magical forest aesthetic
- **Twitch Developer Community** - API documentation and support
- **React Three Fiber Community** - 3D web graphics innovation
- **Vercel** - Serverless platform and deployment
- **Open Source Community** - All the amazing libraries that make this possible

---

**Ready to make your streams magical?** 🌟

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/StreamerTheme&env=TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET)

Quick deploy → Add your Twitch credentials → Start streaming! ✨

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
