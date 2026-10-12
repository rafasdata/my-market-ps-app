import React from 'react';
import { MarketSnapshot } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Coins,
  Award,
  ArrowRightLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DailyOverviewProps {
  data: MarketSnapshot;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigateToTab: (tab: string) => void;
  onGenerateReport: () => void;
}

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  data,
  onRefresh,
  isRefreshing,
  onNavigateToTab,
  onGenerateReport
}) => {
  const { isDark } = useTheme();
  const g21 = data.karats['karat_21'];
  const g24 = data.karats['karat_24'];
  const g18 = data.karats['karat_18'];
  const rashadi = data.sovereigns?.find(s => s.coinId === 'rashadi');
  const english = data.sovereigns?.find(s => s.coinId === 'english');
  const usdIls = data.currencies.find(c => c.pair === 'USD/ILS');
  const jodIls = data.currencies.find(c => c.pair === 'JOD/ILS');
  const eurIls = data.currencies.find(c => c.pair === 'EUR/ILS');

  return (
    <div className="space-y-6">
      {/* Warning / Market Status Notification */}
      {(!data.marketOpenStatus.isOpen || data.warnings.length > 0) && (
        <div className="bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-amber-900 dark:text-amber-300">
              حالة جلسة التداول وملاحظة الشفافية:
            </div>
            <p>{data.marketOpenStatus.reasonAr}</p>
            {data.warnings.map((w, idx) => (
              <p key={idx} className="text-slate-600 dark:text-slate-400">· {w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>الملخص المالي اليومي — فلسطين</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              (محدث حتى {data.lastRefresh})
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            بيانات موثوقة مسترجعة مباشرة من البورصات العالمية وسوق العملات دون بيانات وهمية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('sovereigns')}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Coins className="w-4 h-4 text-slate-950" />
            <span>لوحة وحاسبة الليرات المتخصصة</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-lg transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>التقرير الشامل</span>
          </button>
        </div>
      </div>

      {/* Primary Sovereign Cards (الرشادي والإنجليزي) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              أسعار الليرات الذهب في فلسطين (الليرة الرشادي والليرة الإنجليزي)
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('sovereigns')}
            className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>حاسبة مقارنة عروض الصاغة</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: الليرة الرشادي */}
          {rashadi ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl p-5 shadow-xs transition-all">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{rashadi.nameAr}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                        عيار 21 · 7.20غ
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      القيمة المرجعية الصافية: {rashadi.referenceMeltValueILS.toLocaleString()} ₪ ({rashadi.referenceMeltValueJOD} د.أ)
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  rashadi.isTheoreticalEstimate
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                }`}>
                  {rashadi.isTheoreticalEstimate ? 'محسوب وفق النشرة' : 'معلن بالنشرة الميدانية'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    سعر شراء الزبون (بيع الصائغ)
                  </span>
                  <div className="text-lg lg:text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {rashadi.jewelerSellPriceILS !== null ? `${rashadi.jewelerSellPriceILS.toLocaleString()} ₪` : 'غير متاح'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/40">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-0.5">
                    سعر بيع الزبون (شراء الصائغ)
                  </span>
                  <div className="text-lg lg:text-xl font-black text-blue-700 dark:text-blue-400 font-mono">
                    {rashadi.jewelerBuyPriceILS !== null ? `${rashadi.jewelerBuyPriceILS.toLocaleString()} ₪` : 'غير متاح'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span>التغير 24h:</span>
                  <span className={`font-mono font-bold ${
                    (rashadi.change24hILS || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {(rashadi.change24hILS || 0) >= 0 ? `+${rashadi.change24hILS}` : rashadi.change24hILS} ₪
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>المصدر:</span>
                  <a href={rashadi.source.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 font-medium">
                    <span>{rashadi.source.name.slice(0, 22)}...</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          {/* Card 2: الليرة الإنجليزي */}
          {english ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl p-5 shadow-xs transition-all">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{english.nameAr}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                        عيار 22 · 8.00غ
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      القيمة المرجعية الصافية: {english.referenceMeltValueILS.toLocaleString()} ₪ ({english.referenceMeltValueJOD} د.أ)
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  english.isTheoreticalEstimate
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                }`}>
                  {english.isTheoreticalEstimate ? 'محسوب وفق النشرة' : 'معلن بالنشرة الميدانية'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    سعر شراء الزبون (بيع الصائغ)
                  </span>
                  <div className="text-lg lg:text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {english.jewelerSellPriceILS !== null ? `${english.jewelerSellPriceILS.toLocaleString()} ₪` : 'غير متاح'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/40">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-0.5">
                    سعر بيع الزبون (شراء الصائغ)
                  </span>
                  <div className="text-lg lg:text-xl font-black text-blue-700 dark:text-blue-400 font-mono">
                    {english.jewelerBuyPriceILS !== null ? `${english.jewelerBuyPriceILS.toLocaleString()} ₪` : 'غير متاح'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span>التغير 24h:</span>
                  <span className={`font-mono font-bold ${
                    (english.change24hILS || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {(english.change24hILS || 0) >= 0 ? `+${english.change24hILS}` : english.change24hILS} ₪
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>المصدر:</span>
                  <a href={english.source.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 font-medium">
                    <span>{english.source.name.slice(0, 22)}...</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* General Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gold 21K Palestine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">ذهب عيار 21 في فلسطين</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
              {g21?.jewelerSellPriceILS ? 'بيع الصائغ للزبون' : 'السعر المرجعي'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
              {g21?.jewelerSellPriceILS ? `${g21.jewelerSellPriceILS.toFixed(1)} ₪` : g21?.referencePriceILS ? `${g21.referencePriceILS.toFixed(1)} ₪` : '---'}
            </div>
            <div className={`flex items-center text-xs font-semibold ${
              (g21?.changePercent24h || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {(g21?.changePercent24h || 0) >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-0.5" />
              )}
              <span dir="ltr">
                {(g21?.changePercent24h || 0) >= 0 ? '+' : ''}{g21?.changePercent24h || 0}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span>سعر شراء الصائغ:</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold" dir="ltr">
                {g21?.jewelerBuyPriceILS ? `${g21.jewelerBuyPriceILS.toFixed(1)} ₪` : 'غير متاح'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>مرجعي بالدينار:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold" dir="ltr">
                {g21?.referencePriceJOD ? `${g21.referencePriceJOD.toFixed(1)} د.أ` : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: International Spot Gold */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">أونصة الذهب العالمية (COMEX)</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">دولار / أونصة</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
              ${data.goldSpot.priceUSD.toFixed(2)}
            </div>
            <div className={`flex items-center text-xs font-semibold ${
              data.goldSpot.changePercent24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {data.goldSpot.changePercent24h >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-0.5" />
              )}
              <span dir="ltr">
                {data.goldSpot.changePercent24h >= 0 ? '+' : ''}{data.goldSpot.changePercent24h}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>التغير اليومي:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold" dir="ltr">
              {data.goldSpot.change24hUSD >= 0 ? '+' : ''}{data.goldSpot.change24hUSD} $
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>المصدر:</span>
            <span>عقد الذهب الآجل / الفوري COMEX</span>
          </div>
        </div>

        {/* Card 3: USD / ILS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-xl p-4 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-bold text-sky-600 dark:text-sky-400">الدولار الأمريكي / شيكل (USD/ILS)</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">بين البنوك</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
              {usdIls?.rate.toFixed(4) || '---'} ₪
            </div>
            <div className={`flex items-center text-xs font-semibold ${
              (usdIls?.changePercent24h || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {(usdIls?.changePercent24h || 0) >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-0.5" />
              )}
              <span dir="ltr">
                {(usdIls?.changePercent24h || 0) >= 0 ? '+' : ''}{usdIls?.changePercent24h || 0}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>نطاق اليوم (أدنى/أعلى):</span>
            <span className="font-mono text-slate-800 dark:text-slate-200" dir="ltr">
              {usdIls?.low24h} - {usdIls?.high24h}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>النوع:</span>
            <span>سعر سوقي (لا يشمل عمولة الصراف)</span>
          </div>
        </div>

        {/* Card 4: JOD / ILS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">الدينار الأردني / شيكل (JOD/ILS)</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">سعر الصرف</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
              {jodIls?.rate.toFixed(4) || '---'} ₪
            </div>
            <div className={`flex items-center text-xs font-semibold ${
              (jodIls?.changePercent24h || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {(jodIls?.changePercent24h || 0) >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-0.5" />
              )}
              <span dir="ltr">
                {(jodIls?.changePercent24h || 0) >= 0 ? '+' : ''}{jodIls?.changePercent24h || 0}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>سعر ربط الدينار:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200" dir="ltr">1 USD = 0.709 JOD</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>المعادلة:</span>
            <span>سعر الدولار ÷ 0.709</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Palestinian Gold Karats & Currency Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Palestinian Gold Karats Snapshot */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>أسعار أعيرة الذهب في فلسطين</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">(ILS / Gram)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                محسوبة مباشرة من سعر الأونصة العالمي وسعر صرف الدولار/شيكل
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('gold')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              عرض التفاصيل والنقابات ←
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2 px-2">العيار</th>
                  <th className="py-2 px-2 text-left text-emerald-700 dark:text-emerald-400">بيع الصائغ</th>
                  <th className="py-2 px-2 text-left text-rose-700 dark:text-rose-400">شراء الصائغ</th>
                  <th className="py-2 px-2 text-left text-amber-700 dark:text-amber-400">السعر المرجعي</th>
                  <th className="py-2 px-2 text-left">بالدينار (JOD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {[24, 22, 21, 18, 14].map((k) => {
                  const item = data.karats[`karat_${k}`];
                  if (!item) return null;
                  const isBenchmark = k === 21;
                  return (
                    <tr
                      key={k}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isBenchmark ? 'bg-amber-500/10 font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isBenchmark ? 'bg-amber-500' : 'bg-slate-400'}`} />
                          <span className="font-semibold">عيار {k}</span>
                          {isBenchmark && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-normal">
                              (المعيار الأساسي)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-left font-mono font-bold text-emerald-600 dark:text-emerald-400" dir="ltr">
                        {item.jewelerSellPriceILS !== null ? `${item.jewelerSellPriceILS.toFixed(1)} ₪` : <span className="text-slate-400 text-[10px]">غير متاح</span>}
                      </td>
                      <td className="py-2.5 px-2 text-left font-mono font-bold text-rose-600 dark:text-rose-400" dir="ltr">
                        {item.jewelerBuyPriceILS !== null ? `${item.jewelerBuyPriceILS.toFixed(1)} ₪` : <span className="text-slate-400 text-[10px]">غير متاح</span>}
                      </td>
                      <td className="py-2.5 px-2 text-left font-mono text-amber-600 dark:text-amber-400 font-semibold" dir="ltr">
                        {item.referencePriceILS !== null ? `${item.referencePriceILS.toFixed(1)} ₪` : '---'}
                      </td>
                      <td className="py-2.5 px-2 text-left font-mono text-slate-500 dark:text-slate-400" dir="ltr">
                        {item.referencePriceJOD !== null ? `${item.referencePriceJOD.toFixed(1)} د.أ` : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-300">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>ملاحظة أمانة الصاغة:</span>
            </div>
            <p>
              السعر الفوري هو قيمة الذهب الخام الصافي. في محلات الصاغة الفلسطينية (رام الله، نابلس، الخليل، غزة، القدس)، يُباع المشغول بمصنعية تتراوح بين 15 إلى 35 شيكل للجرام حسب نوع المشغول (محلي، كويتي، تركي، إيطالي).
            </p>
          </div>
        </div>

        {/* Currency Rates Snapshot */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>أسعار الصرف مقابل الشيكل</span>
                <span className="text-xs text-sky-600 dark:text-sky-400 font-mono">(FX Rates)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                سعر التداول الفوري المرجعي وسعر ربط الدينار
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('currencies')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              محول العملات الكامل ←
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.currencies.slice(0, 4).map((c) => (
              <div key={c.pair} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{c.nameAr}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({c.pair})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {c.rateTypeLabelAr}
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-white" dir="ltr">
                    {c.rate.toFixed(4)} ₪
                  </div>
                  <div className={`text-[11px] font-mono ${
                    c.changePercent24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`} dir="ltr">
                    {c.changePercent24h >= 0 ? '+' : ''}{c.changePercent24h}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>إشعار سلطة النقد والمصارف:</span>
            </div>
            <p>
              الأسعار المعروضة هي أسعار التداول بين البنوك والمؤسسات المالية العالمية. أسعار البيع والشراء النقدية (الكاش) في محلات الصرافة تتضمن فارق عمولة بنحو 1 إلى 3 قروش.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Verified Arabic News Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>الأخبار الاقتصادية المؤثرة على الأسواق</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">(Live RSS)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              أخبار موثقة بروابطها الأصلية وتاريخ نشرها الصريح من شبكة الجزيرة وبي بي سي عربي
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('briefing')}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
          >
            تقرير التحليل الكامل ←
          </button>
        </div>

        {data.news.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            جاري استرجاع الأخبار الاقتصادية المحدثة...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.news.slice(0, 6).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-3.5 rounded-lg flex flex-col justify-between transition-all group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{item.publisher}</span>
                    <span className="truncate max-w-[120px]">{item.publishedAt.slice(0, 16)}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>المقال الأصلي</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
