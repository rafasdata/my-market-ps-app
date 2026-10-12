/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketSnapshot, DailyReport, NewBulletinInput } from './types/market';
import { Navbar } from './components/Navbar';
import { DailyOverview } from './components/DailyOverview';
import { SovereignsSection } from './components/SovereignsSection';
import { PalestineGoldTable } from './components/PalestineGoldTable';
import { CurrencySection } from './components/CurrencySection';
import { InteractiveCharts } from './components/InteractiveCharts';
import { DailyBriefing } from './components/DailyBriefing';
import { CraftsmanshipCalculator } from './components/CraftsmanshipCalculator';
import { SourceTransparency } from './components/SourceTransparency';
import { RefreshCw, AlertOctagon } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainDashboard() {
  const { isDark } = useTheme();
  const [marketData, setMarketData] = useState<MarketSnapshot | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest market data
  const loadMarketData = async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/market/latest${force ? '?force=true' : ''}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMarketData(json.data);
        setError(null);
      } else {
        throw new Error(json.error || 'فشل في استرجاع بيانات السوق');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError((err as Error).message || 'تعذر الاتصال بخادم البيانات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Generate or fetch daily report
  const loadDailyReport = async (snapshot?: MarketSnapshot) => {
    setIsLoadingReport(true);
    try {
      const targetSnapshot = snapshot || marketData;
      const res = await fetch('/api/market/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot: targetSnapshot })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDailyReport(json.data);
      }
    } catch (err) {
      console.warn('Report error:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    loadMarketData().then(() => {
      loadDailyReport();
    });
  }, []);

  const handleManualRefresh = async () => {
    await loadMarketData(true);
    await loadDailyReport();
  };

  const handleSaveBulletin = async (bulletin: NewBulletinInput) => {
    const res = await fetch('/api/bulletins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulletin)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    // Refresh snapshot to include new bulletin
    await loadMarketData(false);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`} dir="rtl">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastRefresh={marketData?.lastRefresh || ''}
        latestObservationDate={marketData?.latestObservationDate || ''}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
        isStale={marketData?.isStale || false}
        hasDegradedSources={marketData?.sourcesHealth?.some(s => s.status !== 'online') || false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
            <div className="space-y-1">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                جاري الاتصال بمزودات الأسواق الحقيقية...
              </h2>
              <p className={`text-xs max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                نقوم باسترجاع أسعار بورصة المعادن الثمينة COMEX وسوق العملات المفتوح وتغذيات الأخبار الاقتصادية الرسمية.
              </p>
            </div>
          </div>
        ) : error && !marketData ? (
          <div className={`border rounded-2xl p-8 max-w-xl mx-auto my-12 text-center space-y-4 ${
            isDark ? 'bg-rose-950/40 border-rose-800/80' : 'bg-rose-50 border-rose-200'
          }`}>
            <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              البيانات غير متاحة حالياً
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-rose-200' : 'text-rose-700'}`}>
              تعذر الاتصال بمزودات البيانات أو هناك مشكلة في استرجاع الأسعار. لا نقوم باختلاق أي أسعار وهمية بديلة حفاظاً على النزاهة والمصداقية.
            </p>
            {error && (
              <div className={`p-3 rounded-lg text-xs font-mono text-right overflow-x-auto ${
                isDark ? 'bg-slate-900/80 text-rose-300 border border-rose-900/50' : 'bg-rose-100/70 text-rose-800 border border-rose-200'
              }`} dir="ltr">
                <span className="font-bold">تشخيص الخطأ: </span>
                <span>{error}</span>
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => loadMarketData(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إعادة المحاولة الآن
              </button>
            </div>
          </div>
        ) : marketData ? (
          <div>
            {activeTab === 'overview' && (
              <DailyOverview
                data={marketData}
                onRefresh={handleManualRefresh}
                isRefreshing={isRefreshing}
                onNavigateToTab={setActiveTab}
                onGenerateReport={() => {
                  setActiveTab('briefing');
                  loadDailyReport();
                }}
              />
            )}

            {activeTab === 'sovereigns' && (
              <SovereignsSection
                data={marketData}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'gold' && (
              <PalestineGoldTable
                data={marketData}
                onSaveBulletin={handleSaveBulletin}
              />
            )}

            {activeTab === 'currencies' && (
              <CurrencySection
                data={marketData}
              />
            )}

            {activeTab === 'charts' && (
              <InteractiveCharts
                currentGold21kReferenceILS={marketData.karats['karat_21']?.referencePriceILS || 388}
                currentGold21kLocalSellILS={marketData.karats['karat_21']?.jewelerSellPriceILS ?? null}
                currentGold21kLocalBuyILS={marketData.karats['karat_21']?.jewelerBuyPriceILS ?? null}
                currentRashadiSellILS={marketData.sovereigns?.find(s => s.coinId === 'rashadi')?.jewelerSellPriceILS ?? null}
                currentRashadiBuyILS={marketData.sovereigns?.find(s => s.coinId === 'rashadi')?.jewelerBuyPriceILS ?? null}
                currentRashadiRefILS={marketData.sovereigns?.find(s => s.coinId === 'rashadi')?.referenceMeltValueILS ?? null}
                currentEnglishSellILS={marketData.sovereigns?.find(s => s.coinId === 'english')?.jewelerSellPriceILS ?? null}
                currentEnglishBuyILS={marketData.sovereigns?.find(s => s.coinId === 'english')?.jewelerBuyPriceILS ?? null}
                currentEnglishRefILS={marketData.sovereigns?.find(s => s.coinId === 'english')?.referenceMeltValueILS ?? null}
                currentGoldSpotUSD={marketData.goldSpot.priceUSD}
                currentUsdIls={marketData.currencies[0]?.rate || 3.06}
                currentJodIls={marketData.currencies[1]?.rate || 4.31}
              />
            )}

            {activeTab === 'briefing' && (
              <DailyBriefing
                data={marketData}
                report={dailyReport}
                isLoadingReport={isLoadingReport}
                onGenerateReport={() => loadDailyReport(marketData)}
              />
            )}

            {activeTab === 'calculator' && (
              <CraftsmanshipCalculator
                data={marketData}
              />
            )}

            {activeTab === 'transparency' && (
              <SourceTransparency
                sources={marketData.sourcesHealth}
                lastRefresh={marketData.lastRefresh}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-xs transition-colors duration-200 ${
        isDark ? 'border-slate-900 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-white text-slate-500 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              سوقي — فلسطين (My Market — Palestine)
            </span>
            <span>·</span>
            <span>منصة المعلومات المالية المستقلة</span>
          </div>

          <div className="text-[11px] text-center sm:text-left">
            بيانات فعلية موثقة · لا أرقام وهمية · أسعار بورصة COMEX وسوق الصرف الدولي
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainDashboard />
    </ThemeProvider>
  );
}
