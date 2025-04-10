import React, { useEffect, useState } from 'react';

const markets = [
  { name: 'New York', timezone: 'America/New_York', open: 9, close: 16 },
  { name: 'London', timezone: 'Europe/London', open: 8, close: 16 },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', open: 9, close: 15 },
  { name: 'Sydney', timezone: 'Australia/Sydney', open: 10, close: 16 },
];

const flags: Record<string, string> = {
  'New York': '🇺🇸',
  'London': '🇬🇧',
  'Tokyo': '🇯🇵',
  'Sydney': '🇦🇺',
};

export default function MarketStatus() {
  const [times, setTimes] = useState<{ [key: string]: Date }>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: { [key: string]: Date } = {};
      markets.forEach((market) => {
        const now = new Date().toLocaleString('en-US', { timeZone: market.timezone });
        newTimes[market.name] = new Date(now);
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-wrap justify-center gap-6 text-sm">
      {markets.map((market) => {
        const localTime = times[market.name];
        const hour = localTime?.getHours() ?? 0;
        const minutes = localTime?.getMinutes() ?? 0;
        const seconds = localTime?.getSeconds() ?? 0;
        const isOpen = hour >= market.open && hour < market.close;

        const offset = localTime ? localTime.getTimezoneOffset() / -60 : 0;
        const nextEvent = isOpen ? market.close : market.open;
        const delta = (nextEvent - hour + (nextEvent <= hour ? 24 : 0));

        return (
          <div
            key={market.name}
            className={`min-w-[180px] px-4 py-3 rounded-lg shadow-md text-center ${
              isOpen ? 'bg-green-800/30 ring-2 ring-green-500' : 'bg-red-800/20 ring-2 ring-red-500'
            }`}
          >
            <h3 className="text-white font-bold mb-1">
              {flags[market.name]} {market.name}
            </h3>
            <p className="text-gray-300 text-sm mb-1">
              UTC {offset >= 0 ? '+' : ''}{offset}
            </p>
            <p className="text-white font-mono text-xl">
              {`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </p>
            <p className={`${isOpen ? 'text-green-400' : 'text-red-400'} text-xs mt-1`}>
              {isOpen ? `🟢 Open – closes in ${delta}h` : `🔴 Closed – opens in ${delta}h`}
            </p>
          </div>
        );
      })}
    </div>
  );
}