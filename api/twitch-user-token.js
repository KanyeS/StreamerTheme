// CORS headers for frontend requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
                          .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                          .setHeader('Access-Control-Allow-Headers', 'Content-Type')
                          .json({});
  }

  try {
    // Get Twitch credentials from Vercel environment variables
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Twitch credentials in Vercel environment variables');
    }

    const { code, refresh_token, redirect_uri, grant_type } = req.body;

    if (!grant_type) {
      throw new Error('Missing grant_type in request body');
    }

    let requestBody;

    if (grant_type === 'authorization_code') {
      // Exchange authorization code for tokens
      if (!code || !redirect_uri) {
        throw new Error('Missing code or redirect_uri for authorization_code grant');
      }

      requestBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
      });
    } else if (grant_type === 'refresh_token') {
      // Refresh existing token
      if (!refresh_token) {
        throw new Error('Missing refresh_token for refresh_token grant');
      }

      requestBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      });
    } else {
      throw new Error(`Unsupported grant_type: ${grant_type}`);
    }

    // Make request to Twitch
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Twitch API error: ${tokenResponse.status} - ${errorData}`);
    }

    const tokenData = await tokenResponse.json();

    // Return the tokens to the frontend
    res.status(200).setHeader('Access-Control-Allow-Origin', '*')
                   .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                   .setHeader('Access-Control-Allow-Headers', 'Content-Type')
                   .json(tokenData);

  } catch (error) {
    console.error('Error in twitch-user-token function:', error);
    res.status(500).setHeader('Access-Control-Allow-Origin', '*')
                   .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                   .setHeader('Access-Control-Allow-Headers', 'Content-Type')
                   .json({
                     error: 'Failed to process Twitch user token request',
                     message: error instanceof Error ? error.message : 'Unknown error',
                   });
  }
};
