// pages/api/cryptopanic.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface CryptoPanicPost {
  title: string;
  url: string;
  source: {
    title: string;
  };
  published_at: string;
}

interface CryptoPanicResponse {
  results: CryptoPanicPost[];
}

interface ErrorResponse {
  error: string;
}

type ApiResponse = CryptoPanicResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://cryptopanic.com/api/v1/posts/?auth_token=ca717c350acffacc2a3ca865d63523f608f96d7a&public=true'
    );
    
    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`);
    }
    
    const data: CryptoPanicResponse = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from CryptoPanic API');
    }

    res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in proxying CryptoPanic:', errorMessage);
    res.status(500).json({ error: 'Failed to fetch CryptoPanic data' });
  }
}