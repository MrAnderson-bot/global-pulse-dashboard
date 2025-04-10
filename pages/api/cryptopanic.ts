// pages/api/cryptopanic.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface CryptoPanicResponse {
  results: Array<{
    title: string;
    url: string;
    published_at: string;
    domain: string;
    votes: {
      negative: number;
      positive: number;
      important: number;
      liked: number;
      disliked: number;
      lol: number;
      toxic: number;
      saved: number;
      comments: number;
    };
  }>;
  next: string | null;
  count: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CryptoPanicResponse | { error: string }>
) {
  const { filter, currencies, regions, kind, isPublic } = req.query;
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  try {
    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${auth}&public=${isPublic || 'true'}&filter=${filter || 'hot'}&currencies=${currencies || 'BTC'}&regions=${regions || 'en'}&kind=${kind || 'news'}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CryptoPanicResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching CryptoPanic data:', error);
    res.status(500).json({ error: 'Failed to fetch CryptoPanic data' });
  }
}