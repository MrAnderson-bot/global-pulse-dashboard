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

interface MacroData {
  gdp: string;
  cpi: string;
  unemployment: string;
  fearGreed: string;
  fearGreedValue: string;
  vix: string;
  recessionRisk: string;
  centralBanks: Bank[];
}

const MacroWatch = () => {
  const [seriesId, setSeriesId] = useState('GDP');
  const [observations, setObservations] = useState<FREDObservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [macroData, setMacroData] = useState<MacroData>({
    gdp: 'N/A',
    cpi: 'N/A',
    unemployment: 'N/A',
    fearGreed: 'Neutral',
    fearGreedValue: '0',
    vix: 'N/A',
    recessionRisk: 'Low',
    centralBanks: []
  });

  const [gdpData, setGdpData] = useState<FREDObservation[]>([]);
  const [cpiData, setCpiData] = useState<FREDObservation[]>([]);
  const [unemploymentData, setUnemploymentData] = useState<FREDObservation[]>([]);
  const [vix, setVix] = useState<string>('N/A');
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchFREDData = async (seriesId: string): Promise<FREDObservation[]> => {
    try {
      const response = await fetch(`/api/fred?series_id=${seriesId}`);
      const data: FREDResponse = await response.json();
      return data.observations;
    } catch (error) {
      console.error(`Error fetching FRED data for ${seriesId}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch GDP data
        const gdpData = await fetchFREDData('GDP');
        setGdpData(gdpData);

        // Fetch CPI data
        const cpiData = await fetchFREDData('CPIAUCSL');
        setCpiData(cpiData);

        // Fetch Unemployment data
        const unemploymentData = await fetchFREDData('UNRATE');
        setUnemploymentData(unemploymentData);

        // VIX (proxy)
        let vixValue = 'N/A';
        try {
          const proxyRes = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/^VIX'));
          if (!proxyRes.ok) {
            throw new Error('Failed to fetch VIX data');
          }
          const proxyJson = await proxyRes.json();
          const vixJson = JSON.parse(proxyJson.contents);
          vixValue = vixJson?.chart?.result?.[0]?.meta?.regularMarketPrice || 'N/A';
          setVix(vixValue);
        } catch (vixError) {
          console.error('Error fetching VIX data:', vixError);
          setVix('N/A');
        }

        // Fear & Greed Index
        const fgRes = await fetch('https://api.alternative.me/fng/?limit=1');
        const fgData = await fgRes.json();
        const fgItem = fgData?.data?.[0] || {};
        const fearGreedValue = fgItem.value || '0';
        const fearGreedClassification = fgItem.value_classification || 'Neutral';

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

        // Update the state with all the data
        setMacroData({
          gdp: gdpData[gdpData.length - 1]?.value || 'N/A',
          cpi: cpiData[cpiData.length - 1]?.value || 'N/A',
          unemployment: unemploymentData[unemploymentData.length - 1]?.value || 'N/A',
          fearGreed: fearGreedClassification,
          fearGreedValue,
          vix: vixValue.toString(),
          recessionRisk: 'Low',
          centralBanks: banks
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
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