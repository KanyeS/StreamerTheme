import { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers for frontend requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    // Get Twitch credentials from Vercel environment variables
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Twitch credentials in Vercel environment variables');
    }

    // Get OAuth token from Twitch
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Twitch API error: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    // Return the access token to the frontend
    res.status(200).json({
      access_token: tokenData.access_token,
      client_id: clientId,
    });

  } catch (error) {
    console.error('Error in twitch-auth function:', error);
    res.status(500).json({
      error: 'Failed to get Twitch credentials',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
