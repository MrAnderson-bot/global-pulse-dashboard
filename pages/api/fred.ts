import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { seriesId } = req.query;

  const apiKey = '5953d0603459d5bcd27177fac126a712';
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('FRED API error:', error);
    res.status(500).json({ error: 'Failed to fetch from FRED' });
  }
}
