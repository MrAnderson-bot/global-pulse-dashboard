import MarketStatus from '../components/MarketStatus';
import GlobalPulseFeed from '../components/GlobalPulseFeed';
import MacroWatch from '../components/MacroWatch';


export default function Home() {
  return (
    <main className="min-h-screen bg-darkblue text-white p-6 font-sans">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">🌍 Global Pulse Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Track global market sentiment, macro news & economic shifts in real time — no logins, no fluff.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">🌐 Market Status</h2>
          <MarketStatus />
        </div>

        <div className="bg-gray-900 p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">📰 Global Pulse Feed</h2>
          <GlobalPulseFeed />
        </div>

        <div className="bg-gray-900 p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">📉 Macro Watch</h2>
<MacroWatch />
        </div>

        <div className="bg-gray-900 p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">🔥 Real Talk</h2>
          <p className="text-gray-300 text-sm">Your no-filter commentary lives here</p>
        </div>
      </section>
    </main>
  );
}