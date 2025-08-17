@echo off
echo 🔒 Setting up HTTPS for local development...

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ OpenSSL found, creating self-signed certificate...
    
    REM Create self-signed certificate
    openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost-cert.pem -days 365 -nodes -subj "/CN=localhost"
    
    echo ✅ Certificate files created:
    echo    - localhost-key.pem
    echo    - localhost-cert.pem
    echo.
    echo 🔧 Next steps:
    echo 1. Update your vite.config.ts with the HTTPS configuration (see SETUP.md)
    echo 2. Use https://localhost:3000 in your Twitch app redirect URL
    echo 3. Start your dev server and accept the certificate in your browser
    
) else (
    echo ❌ OpenSSL not found. Options:
    echo 1. Install Git for Windows (includes OpenSSL)
    echo 2. Use PowerShell New-SelfSignedCertificate (see SETUP.md)
    echo 3. Use ngrok instead: npm install -g ngrok
)

pause
