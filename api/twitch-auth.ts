import { VercelRequest, VercelResponse } from '@vercel/node';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

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
    // Initialize AWS SSM client
    const ssmClient = new SSMClient({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Get Twitch credentials from Parameter Store
    const [clientIdParam, clientSecretParam] = await Promise.all([
      ssmClient.send(new GetParameterCommand({
        Name: '/twitch/client-id',
        WithDecryption: true,
      })),
      ssmClient.send(new GetParameterCommand({
        Name: '/twitch/client-secret',
        WithDecryption: true,
      })),
    ]);

    const clientId = clientIdParam.Parameter?.Value;
    const clientSecret = clientSecretParam.Parameter?.Value;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Twitch credentials in Parameter Store');
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
