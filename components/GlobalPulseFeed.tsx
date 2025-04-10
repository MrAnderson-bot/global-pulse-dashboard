import React, { useEffect, useState, useCallback } from 'react';

const keywords = [
  'inflation', 'interest rate', 'bond yields', 'unemployment', 'gdp',
  'tariff', 'crypto', 'bitcoin', 'ethereum', 'XRP', 'altcoin',
  'central bank', 'federal reserve', 'recession', 'deflation', 'market crash',
  'trump', 'us', 'trade deals', 'china', 'eu',
  'supply chain', 'manufacturing', 'oil', 'gas', 'energy prices',
  'sanctions', 'geopolitical', 'ai', 'semiconductors', 'exports', 'imports',
  'BRICS', 'debt ceiling', 'deficit', 'stimulus', 'bond market',
  'south china sea', 'interest hike', 'inflation report', 'fed meeting',
  'opec', 'yields', 'usd', 'yen', 'yuan', 'euro',
  'Scott Bessent', 'stablecoins', 'wall street', 'blackrock', 'margin call',
  's one filing', 'spot xrp etf', 'liquidity', 'ripple', 'david schwartz',
  'rl usd', 'xrp ledger', 'institutional', 'acquisition', 'quantum',
  'brad garlinghouse', 'xlm', 'ada', 'hbar', 'algo', 'cspr', 'avax',
  'btc', 'eth', 'matic', 'poly', 'ondo', 'sol', 'str', 'trb', 'xcn', 'xdc', 'xpr', 'lunc'
];

type NewsItem = {
  title: string;
  link: string;
  source_id: string;
  pubDate: string;
  category?: 'Macro' | 'Crypto' | 'Geopolitical' | 'Energy' | 'Tech' | 'Finance' | 'Other';
  isNew?: boolean;
  isTrending?: boolean;
};

const categoryColors: Record<NonNullable<NewsItem['category']>, string> = {
  Crypto: 'text-green-400',
  Macro: 'text-yellow-400',
  Geopolitical: 'text-red-400',
  Energy: 'text-orange-400',
  Tech: 'text-blue-400',
  Finance: 'text-purple-400',
  Other: 'text-gray-400',
};

const categoryKeywords: Record<NonNullable<NewsItem['category']>, string[]> = {
  Crypto: ['bitcoin', 'ethereum', 'crypto', 'altcoin', 'xrp', 'stablecoin', 'blockchain', 'defi', 'nft'],
  Macro: ['inflation', 'interest rate', 'recession', 'bond', 'gdp', 'unemployment', 'central bank', 'federal reserve', 'stimulus', 'debt ceiling'],
  Geopolitical: ['china', 'brics', 'geopolitical', 'trade', 'sanctions', 'south china sea', 'trump', 'us', 'eu', 'trade deals'],
  Energy: ['oil', 'gas', 'energy', 'opec', 'renewable', 'solar', 'wind', 'power'],
  Tech: ['ai', 'semiconductor', 'quantum', 'microsoft', 'google', 'apple', 'meta', 'amazon', 'tesla'],
  Finance: ['wall street', 'blackrock', 'margin call', 's one filing', 'institutional', 'acquisition', 'merger', 'ipo'],
  Other: []
};

const sourceIcons: Record<string, string> = {
  'NewsData': '📰',
  'GNews': '🌐',
  'NYT': '🗞️',
  'CryptoPanic': '₿'
};

interface NewsDataResponse {
  results: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
    source_id: string;
  }>;
}

interface GNewsResponse {
  articles: Array<{
    title: string;
    url: string;
    description: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}

interface NYTResponse {
  response: {
    docs: Array<{
      headline: {
        main: string;
      };
      web_url: string;
      abstract: string;
      pub_date: string;
      source: string;
    }>;
  };
}

interface CryptoPanicItem {
  title: string;
  url: string;
  source?: {
    title: string;
  };
  published_at: string;
}

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

interface ApiError {
  error: string;
  status?: number;
}

interface NYTArticle {
  title: string;
  url: string;
  description: string;
  published_date: string;
  source: string;
}

export default function GlobalPulseFeed() {
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nytArticles, setNYTArticles] = useState<NYTArticle[]>([]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const allResults: NewsItem[] = [];

    const categorize = (title: string): NewsItem['category'] => {
      const t = title.toLowerCase();
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => t.includes(kw))) {
          return category as NewsItem['category'];
        }
      }
      return 'Other';
    };

    try {
      // NewsData API
      try {
        console.log('Fetching from NewsData...');
        const res = await fetch('/api/newsdata');
        const data: NewsDataResponse = await res.json();
        console.log('NewsData response:', data);
        (data.results || []).forEach((item: { title: string; link: string; description: string; pubDate: string; source_id: string; }) => {
          if (keywords.some((kw) => item.title?.toLowerCase().includes(kw))) {
            allResults.push({
              title: item.title,
              link: item.link,
              category: categorize(item.title),
              source_id: `[NewsData] ${item.source_id}`,
              pubDate: item.pubDate,
            });
          }
        });
      } catch (error: unknown) {
        const err = error as Error;
        console.error('NewsData fetch error:', err.message);
      }

      // GNews API - Temporarily disabled due to API issues
      /*
      try {
        console.log('Fetching from GNews...');
        const gnewsRes = await fetch('/api/gnews');
        const gnewsRes = await fetch(`https://gnews.io/api/v4/top-headlines?token=0775ec62695f4a9575354bff4a759fcf&lang=en&topic=business`);
        if (gnewsRes.ok) {
          const gnewsData: GNewsResponse = await gnewsRes.json();
          console.log('GNews response:', gnewsData);
          (gnewsData.articles || []).forEach((item: GNewsItem) => {
            if (keywords.some((kw) => item.title?.toLowerCase().includes(kw))) {
              allResults.push({
                title: item.title,
                link: item.url,
                category: categorize(item.title),
                source_id: '[GNews] ' + item.source?.name,
                pubDate: item.publishedAt,
              });
            }
          });
        } else {
          console.warn('GNews API error:', gnewsRes.status);
        }
      } catch (err) {
        console.warn('GNews fetch error:', err);
      }
      */

      // NYT API
      try {
        console.log('Fetching from NYT...');
        const response = await fetch('/api/nyt');
        const data: NYTResponse = await response.json();
        console.log('NYT response:', data);
        setNYTArticles(data.response.docs.map(doc => ({
          title: doc.headline.main,
          url: doc.web_url,
          description: doc.abstract,
          published_date: doc.pub_date,
          source: doc.source
        })));
      } catch (error: unknown) {
        const err = error as Error;
        console.error('NYT fetch error:', err.message);
      }

      // Add CryptoPanic as a fallback
      try {
        console.log('Fetching from CryptoPanic...');
        const cryptoRes = await fetch(`/api/cryptopanic`);
        if (cryptoRes.ok) {
          const cryptoData: CryptoPanicResponse = await cryptoRes.json();
          (cryptoData.results || []).forEach((item: CryptoPanicItem) => {
            if (item?.title && item?.url && keywords.some((kw) => item.title.toLowerCase().includes(kw))) {
              allResults.push({
                title: item.title,
                link: item.url,
                category: categorize(item.title),
                source_id: '[CryptoPanic] ' + (item.source?.title || 'Unknown'),
                pubDate: item.published_at,
              });
            }
          });
        } else {
          console.warn('CryptoPanic API error:', cryptoRes.status);
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.warn('CryptoPanic fetch error:', err.message);
      }

      console.log('Total results before deduplication:', allResults.length);

      const sorted = allResults.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      const unique = new Map();
      const deduped = sorted.filter((item) => {
        if (unique.has(item.title)) return false;
        unique.set(item.title, true);
        return true;
      });

      console.log('Results after deduplication:', deduped.length);

      // Mark new articles (within last hour)
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const enhancedResults = deduped.map(item => ({
        ...item,
        isNew: new Date(item.pubDate) > oneHourAgo,
        isTrending: Math.random() > 0.7 // Simulated trending status
      }));

      console.log('Final results:', enhancedResults);
      setHeadlines(enhancedResults);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Detailed error:', err);
      setError(`Failed to fetch news: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filteredHeadlines = selectedCategory 
    ? headlines.filter(item => item.category === selectedCategory)
    : headlines;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/50 p-4 rounded-xl text-red-200">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-2 text-red-300 hover:text-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                !selectedCategory 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {Object.keys(categoryColors).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {Object.entries(categoryColors).map(([category, color]) => {
            const categoryNews = filteredHeadlines.filter(item => item.category === category);
            if (categoryNews.length === 0) return null;
            
            return (
              <div key={category} className="bg-gray-800 p-4 rounded-xl shadow">
                <h2 className={`text-lg font-bold mb-3 ${color}`}>{category}</h2>
                <div className="space-y-3">
                  {categoryNews.map((item, index) => (
                    <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {item.isNew && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                          {item.isTrending && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                              Trending
                            </span>
                          )}
                        </div>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                        >
                          {item.title}
                        </a>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 transition-colors flex items-center gap-1"
                          >
                            {sourceIcons[item.source_id.split(']')[0].slice(1)] || '🔗'} {item.source_id}
                          </a>
                          <span className="ml-2 whitespace-nowrap">
                            {new Date(item.pubDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}