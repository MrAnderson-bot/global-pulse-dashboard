import React, { useEffect, useState, useCallback } from 'react';

// Types
type Bank = {
  name: string;
  rate: string;
  stance: string;
};

interface FREDObservation {
  value: string;
  date: string;
}

interface FREDResponse {
  observations: FREDObservation[];
}

const MacroWatch = () => {
  const [seriesId, setSeriesId] = useState('GDP');
  const [observations, setObservations] = useState<FREDObservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [macroData, setMacroData] = useState<{
    fearGreed: string;
    fearGreedValue: string;
    vix: string;
    recessionRisk: string;
    centralBanks: Bank[];
  }>({
    fearGreed: 'Loading...',
    fearGreedValue: '0',
    vix: 'Loading...',
    recessionRisk: 'Loading...',
    centralBanks: [],
  });

  // ✅ Local API route fetch instead of direct call to FRED
  const fetchRateFromFRED = async (seriesId: string): Promise<string> => {
    try {
      const res = await fetch(`/api/fred?seriesId=${seriesId}`);
      const data = await res.json();
      if (!data.observations || !Array.isArray(data.observations)) {
        console.error(`Invalid FRED data structure for ${seriesId}:`, data);
        return 'N/A';
      }
      const latest = data.observations.reverse().find((o: FREDObservation) => o.value !== '.');
      return latest ? `${parseFloat(latest.value).toFixed(2)}%` : 'N/A';
    } catch (err) {
      console.error(`Local FRED proxy error for ${seriesId}:`, err);
      return 'Error';
    }
  };

  const fetchFREDData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${process.env.NEXT_PUBLIC_FRED_API_KEY}&file_type=json`
      );
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status}`);
      }
      const data: FREDResponse = await response.json();
      if (!data.observations || !Array.isArray(data.observations)) {
        throw new Error('Invalid FRED API response format');
      }
      setObservations(data.observations);
    } catch (error) {
      console.error('Error fetching FRED data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch FRED data');
    }
  }, [seriesId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fear & Greed Index
        const fgRes = await fetch('https://api.alternative.me/fng/?limit=1');
        const fgData = await fgRes.json();
        const fgItem = fgData?.data?.[0] || {};
        const fearGreedValue = fgItem.value || '0';
        const fearGreedClassification = fgItem.value_classification || 'Neutral';

        // VIX (proxy)
        const proxyRes = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/^VIX'));
        const proxyJson = await proxyRes.json();
        const vixJson = JSON.parse(proxyJson.contents);
        const vixClose = vixJson?.chart?.result?.[0]?.meta?.regularMarketPrice || 'N/A';

        // FRED Rates via local proxy
        const fed = await fetchRateFromFRED('FEDFUNDS');
        const ecb = await fetchRateFromFRED('ECBDFR');
        const boj = await fetchRateFromFRED('IRSTCI01JPM156N');
        const rba = await fetchRateFromFRED('IRSTCI01AUM156N');

        const banks: Bank[] = [
          { name: 'Fed', rate: fed, stance: parseFloat(fed) >= 5 ? '🦅 Hawkish' : '🕊️ Dovish' },
          { name: 'ECB', rate: ecb, stance: parseFloat(ecb) >= 3 ? '🦅 Hawkish' : '🕊️ Dovish' },
          { name: 'BoJ', rate: boj, stance: parseFloat(boj) >= 0 ? '🦅 Hawkish' : '🕊️ Dovish' },
          { name: 'RBA', rate: rba, stance: parseFloat(rba) >= 4 ? '🦅 Hawkish' : '🕊️ Dovish' }
        ];

        setMacroData({
          fearGreed: fearGreedClassification,
          fearGreedValue,
          vix: vixClose.toString(),
          recessionRisk: 'Low',
          centralBanks: banks
        });
      } catch (err) {
        console.error('Error fetching macro data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 text-sm text-gray-200">
      <div className="bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-2">📊 Macro Sentiment Index</h3>
        <p>🧠 Fear & Greed Index: <span className="font-semibold text-yellow-300">{macroData.fearGreed} ({macroData.fearGreedValue}/100)</span></p>
        <p>⚡ VIX Volatility Index: <span className="font-semibold text-red-400">{macroData.vix}</span></p>
        <p>📉 Recession Probability: <span className="font-semibold text-green-400">{macroData.recessionRisk}</span></p>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-2">🏦 Central Bank Tracker (Live)</h3>
        {macroData.centralBanks.map((bank) => (
          <div key={bank.name} className="flex justify-between border-b border-gray-700 py-1">
            <span className="pr-4">{bank.name}</span>
            <span className="whitespace-nowrap">
              <span className="text-blue-300">{bank.rate}</span>{' '}
              <span className="ml-2" title={`Current stance: ${bank.stance}`}>{bank.stance}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroWatch;