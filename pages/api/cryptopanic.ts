// pages/api/cryptopanic.ts
export default async function handler(req: any, res: any) {
    try {
      const response = await fetch(
        'https://cryptopanic.com/api/v1/posts/?auth_token=ca717c350acffacc2a3ca865d63523f608f96d7a&public=true'
      );
      const data = await response.json();
      res.status(200).json(data);
    } catch (error: any) {
      console.error('Error in proxying CryptoPanic:', error.message);
      res.status(500).json({ error: 'Failed to fetch CryptoPanic data' });
    }
  }
  