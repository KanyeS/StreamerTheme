#!/bin/bash
# Quick HTTPS setup script for Streamer Theme

echo "🔒 Setting up HTTPS for local development..."

# Check if OpenSSL is available
if command -v openssl &> /dev/null; then
    echo "✅ OpenSSL found, creating self-signed certificate..."
    
    # Create self-signed certificate
    openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost-cert.pem -days 365 -nodes -subj "/CN=localhost"
    
    echo "✅ Certificate files created:"
    echo "   - localhost-key.pem"
    echo "   - localhost-cert.pem"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Update your vite.config.ts with the HTTPS configuration (see SETUP.md)"
    echo "2. Use https://localhost:3000 in your Twitch app redirect URL"
    echo "3. Start your dev server and accept the certificate in your browser"
    
else
    echo "❌ OpenSSL not found. Options:"
    echo "1. Install OpenSSL (comes with Git Bash on Windows)"
    echo "2. Use PowerShell alternative (see SETUP.md)"
    echo "3. Use ngrok instead: npm install -g ngrok"
fi
