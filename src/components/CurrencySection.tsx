import React, { useState, useMemo } from 'react';
import { MarketSnapshot, CurrencyRate } from '../types/market';
import {
  CircleDollarSign,
  ArrowRightLeft,
  Search,
  ExternalLink,
  ShieldAlert,
  Info,
  HelpCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CurrencySectionProps {
  data: MarketSnapshot;
}

export const CurrencySection: React.FC<CurrencySectionProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('ILS');
  const [spreadMode, setSpreadMode] = useState<'market' | 'bank' | 'changer'>('market');

  const usdIls = data.currencies.find(c => c.pair === 'USD/ILS')?.rate || 3.0599;
  const jodIls = data.currencies.find(c => c.pair === 'JOD/ILS')?.rate || 4.315;
  const eurIls = data.currencies.find(c => c.pair === 'EUR/ILS')?.rate || 3.428;
  const tryIls = data.currencies.find(c => c.pair === 'TRY/ILS')?.rate || 0.089;

  // Rate in ILS per 1 unit of currency
  const ratesToIls: Record<string, { rate: number; nameAr: string }> = {
    ILS: { rate: 1, nameAr: 'شيكل إسرائيلي (ILS)' },
    USD: { rate: usdIls, nameAr: 'دولار أمريكي (USD)' },
    JOD: { rate: jodIls, nameAr: 'دينار أردني (JOD)' },
    EUR: { rate: eurIls, nameAr: 'يورو أوروبي (EUR)' },
    TRY: { rate: tryIls, nameAr: 'ليرة تركية (TRY)' },
    XAU_21K: { rate: data.karats['karat_21']?.jewelerSellPriceILS || data.karats['karat_21']?.referencePriceILS || 388, nameAr: 'ذهب عيار 21 (جرام)' },
    XAU_24K: { rate: data.karats['karat_24']?.jewelerSellPriceILS || data.karats['karat_24']?.referencePriceILS || 442, nameAr: 'ذهب عيار 24 نقي (جرام)' },
    XAU_OZ: { rate: (data.goldSpot.priceUSD * usdIls), nameAr: 'أونصة الذهب الكاملة' }
  };

  const filteredRates = useMemo(() => {
    return data.currencies.filter(c =>
      c.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameAr.includes(searchTerm) ||
      c.rateTypeLabelAr.includes(searchTerm)
    );
  }, [data.currencies, searchTerm]);

  // Conversion logic with spread fee
  const conversionResult = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return null;

    const fromRateToIls = ratesToIls[fromCurrency]?.rate || 1;
    const toRateToIls = ratesToIls[toCurrency]?.rate || 1;

    // Direct interbank market converted amount
    const rawResult = (numAmount * fromRateToIls) / toRateToIls;

    // Spread deduction
    let spreadPercent = 0;
    let spreadLabel = 'سعر السوق المالي الصافي (بدون عمولة)';
    if (spreadMode === 'bank') {
      spreadPercent = 0.5; // Typical 0.5% retail bank spread
      spreadLabel = 'سعر بنكي تقريبي (خصم هامش عمولة 0.5%)';
    } else if (spreadMode === 'changer') {
      spreadPercent = 1.2; // Typical 1.2% physical cash money changer spread
      spreadLabel = 'سعر صرافة كاش تقديري (خصم هامش صرافة 1.2%)';
    }

    const netResult = rawResult * (1 - spreadPercent / 100);

    return {
      raw: rawResult,
      net: netResult,
      spreadPercent,
      spreadLabel,
      effectiveRate: (fromRateToIls / toRateToIls) * (1 - spreadPercent / 100)
    };
  }, [amount, fromCurrency, toCurrency, spreadMode, usdIls, jodIls, eurIls, tryIls]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="space-y-8">
      {/* Header and Disclaimer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-start gap-3">
          <CircleDollarSign className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              أسعار صرف العملات والتحويل المالي في فلسطين
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              في فلسطين، تشكل العملات الثلاث (الشيكل والدينار الأردني والدولار الأمريكي) سلة النقد الأساسية لحياة المواطنين اليومية والمدخرات والتجارة.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold">تنبيه الشفافية للمستهلك:</span>
            <p className="mt-0.5 text-amber-800 dark:text-amber-200/90 text-[11px] leading-relaxed">
              الأسعار المعروضة هي أسعار التداول بين البنوك أو الأسعار المرجعية الرسمية. لا تمثل هذه الأسعار تعهداً بسعر بيع أو شراء مضمون للمستهلك، حيث تفرض محلات الصرافة والبنوك التجارية عمولة بيع وشراء (Spread) عند تبديل النقد الورقي الكاش.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Currency Converter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              <span>محول العملات والذهب التفاعلي الموثق</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              يحول بدقة بين الشيكل، الدولار، الدينار، اليورو، والذهب الفوري
            </p>
          </div>

          {/* Spread Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSpreadMode('market')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                spreadMode === 'market'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              سعر السوق (0%)
            </button>
            <button
              onClick={() => setSpreadMode('bank')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                spreadMode === 'bank'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              تقدير بنكي (-0.5%)
            </button>
            <button
              onClick={() => setSpreadMode('changer')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                spreadMode === 'changer'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              صرافة كاش (-1.2%)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">المبلغ المراد تحويله</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-amber-500 rounded-lg p-3 text-slate-900 dark:text-white text-base font-mono font-bold"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">من عملة / أصل</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white text-xs"
            >
              {Object.entries(ratesToIls).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center pb-2">
            <button
              onClick={handleSwap}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="تبديل العملتين"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">إلى عملة / أصل</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white text-xs"
            >
              {Object.entries(ratesToIls).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Result Card */}
        {conversionResult && (
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                الناتج التقديري وفق {conversionResult.spreadLabel}:
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono" dir="ltr">
                {conversionResult.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                <span>سعر الصرف المطبق: </span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold" dir="ltr">
                  1 {fromCurrency} = {conversionResult.effectiveRate.toFixed(4)} {toCurrency}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <div>
                <span>سعر البورصة المباشر: </span>
                <span className="font-mono text-slate-900 dark:text-slate-300 font-semibold" dir="ltr">
                  {conversionResult.raw.toFixed(2)} {toCurrency}
                </span>
              </div>
              {conversionResult.spreadPercent > 0 && (
                <div>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">فارق العمولة التقديري ({conversionResult.spreadPercent}%): </span>
                  <span className="font-mono text-rose-600 dark:text-rose-300 font-semibold" dir="ltr">
                    -{(conversionResult.raw - conversionResult.net).toFixed(2)} {toCurrency}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Available Exchange Rates Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>جدول أسعار صرف العملات مقابل الشيكل والدينار</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              كل زوج معروض بنوعه المالي الموثق ومصدره وطابع الوقت
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الرمز (USD, JOD...)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                <th className="py-3 px-3">الزوج والعملة</th>
                <th className="py-3 px-3 text-left">السعر المرجعي / السوقي</th>
                <th className="py-3 px-3 text-left">التغير (24h)</th>
                <th className="py-3 px-3">تصنيف ونوع السعر</th>
                <th className="py-3 px-3">المصدر والتحقق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRates.map((c) => (
                <tr key={c.pair} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono text-amber-600 dark:text-amber-400">{c.pair}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-normal">{c.nameAr}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      نطاق اليوم: {c.low24h} - {c.high24h}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-left font-mono font-bold text-slate-900 dark:text-white text-base" dir="ltr">
                    {c.rate.toFixed(4)} ₪
                  </td>

                  <td className="py-3 px-3 text-left font-mono" dir="ltr">
                    <div className={`font-semibold ${c.changePercent24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {c.changePercent24h >= 0 ? '+' : ''}{c.changePercent24h}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ({c.change24h >= 0 ? '+' : ''}{c.change24h})
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-block text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-medium">
                      {c.rateTypeLabelAr}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-normal">
                      {c.customerAdvisoryAr}
                    </p>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {c.source.name}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      طابع الوقت: {c.source.lastRetrievedAt.slice(11, 19)} UTC
                    </div>
                    <a
                      href={c.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-0.5 font-semibold"
                    >
                      <span>الرابط المباشر</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
