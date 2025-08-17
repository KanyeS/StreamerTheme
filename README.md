# 🎮 Streamer Theme - Magical Forest Overlay

A beautiful React-based streaming overlay with a magical Ghibli-style forest background, real-time Twitch integration, and animated elements perfect for streamers.

## ✨ Features

- **🌲 Magical Forest Background**: Beautiful 3D Ghibli-style woodland scene with animated trees, fireflies, and floating leaves
- **🎮 Game Display Area**: Central white area with animated flower border for showcasing gameplay
- **📺 Real-time Twitch Integration**: Live viewer count, follower count, stream status, and chat
- **🔐 Secure AWS Integration**: Uses AWS Parameter Store for secure credential management
- **💬 Live Chat Overlay**: Real-time Twitch chat integration with user badges
- **📊 Stream Statistics**: Live viewer count, follower count, uptime, and stream information
- **🎨 Beautiful Animations**: Smooth CSS and WebGL animations throughout
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

1. **Clone and Install**

```bash
git clone <your-repo-url>
cd StreamerTheme
npm install
```

2. **Configure Your Settings**

   - Edit `src/config.ts` with your Twitch username and social media handles
   - The app works in demo mode without AWS setup
   - See `SETUP.md` for complete Twitch API setup instructions

3. **Start Development Server**

```bash
npm run dev
```

4. **Open in Browser**
   - Navigate to `http://localhost:5175` (or the port shown in terminal)
   - Your magical streaming overlay is ready!

## 🎯 Demo Mode vs Live Mode

**Demo Mode (Default)**

- Works immediately without any API setup
- Shows sample data (viewers, followers, etc.)
- Perfect for testing and customization
- No AWS or Twitch credentials required

**Live Mode (Production)**

- Shows real Twitch stream data
- Requires AWS Parameter Store setup
- Follow the complete guide in `SETUP.md`
- Secure credential management

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Three Fiber** - 3D graphics and animations
- **React Three Drei** - 3D utility components
- **Three.js** - Core 3D graphics library
- **tmi.js** - Twitch chat integration
- **AWS SDK v3** - Secure credential management
- **CSS3** - Custom animations and styling

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Scene3D.tsx      # 3D forest background
│   ├── GameArea.tsx     # Game display area with flowers
│   ├── StreamerOverlay.tsx # Stream stats and info
│   └── TwitchChat.tsx   # Live chat integration
├── services/            # API and external services
│   ├── twitchApi.ts     # Twitch API integration
│   └── parameterStore.ts # AWS Parameter Store
├── config.ts            # Application configuration
└── App.tsx              # Main application component
```

## 🔧 Configuration

### Basic Setup

Edit `src/config.ts`:

```typescript
export const config = {
  twitchUsername: "your_twitch_username",
  social: {
    twitter: "your_twitter",
    discord: "your_discord",
    youtube: "your_youtube",
  },
};
```

### Full Twitch API Setup

For real-time stream data, follow the complete setup guide in `SETUP.md`.

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

## 🔐 Security Notes

- Never commit AWS credentials to version control
- Use AWS Parameter Store SecureString for sensitive data
- Regularly rotate Twitch access tokens
- Follow the security guidelines in `SETUP.md`

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete Twitch API and AWS setup guide
- **[Component Documentation](./docs/)** - Detailed component API docs
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions

## 🎯 Use Cases

Perfect for:

- **Game Streamers** - Showcase gameplay with beautiful overlays
- **Just Chatting Streams** - Elegant background for talk shows
- **Creative Streams** - Magical atmosphere for art/music creation
- **Educational Content** - Professional-looking educational streams

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your streaming setup!

## 🙏 Acknowledgments

- **Studio Ghibli** - Inspiration for the magical forest aesthetic
- **Twitch Developer Community** - API documentation and support
- **React Three Fiber Community** - 3D web graphics innovation
- **Open Source Community** - All the amazing libraries that make this possible

---

**Ready to make your streams magical?** 🌟

Follow the setup guide and start streaming with your beautiful new overlay!

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
