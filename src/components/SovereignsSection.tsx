import React, { useState, useMemo } from 'react';
import { MarketSnapshot, SovereignPriceData, SovereignCoinSpec } from '../types/market';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  SlidersHorizontal,
  Compass,
  Store,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
  Award
} from 'lucide-react';

interface SovereignsSectionProps {
  data: MarketSnapshot;
  onNavigateToTab?: (tab: string) => void;
}

interface JewelerOffer {
  id: string;
  name: string;
  offerPriceILS: number;
}

export const SovereignsSection: React.FC<SovereignsSectionProps> = ({ data, onNavigateToTab }) => {
  // Sovereigns data
  const sovereigns = data.sovereigns || [];
  const rashadi = sovereigns.find(s => s.coinId === 'rashadi');
  const english = sovereigns.find(s => s.coinId === 'english');

  // Calculator Mode
  const [calcMode, setCalcMode] = useState<'buy' | 'sell'>('buy');
  const [selectedCoinId, setSelectedCoinId] = useState<'rashadi' | 'english' | 'custom'>('rashadi');

  // Custom specs for coins
  const [customWeight, setCustomWeight] = useState<number>(7.20);
  const [customKarat, setCustomKarat] = useState<number>(21);

  // Buy Mode State
  const [quotedSellPrice, setQuotedSellPrice] = useState<string>(''); // عرض الصائغ للبيع للزبون
  const [extraExpenses, setExtraExpenses] = useState<string>('0'); // مصاريف إضافية / رسوم فحص أو علبة

  // Sell Mode State
  const [originalBuyPrice, setOriginalBuyPrice] = useState<string>(''); // سعر الشراء الأصلي لحساب الربح
  const [jewelerOffers, setJewelerOffers] = useState<JewelerOffer[]>([
    { id: '1', name: 'الصائغ الأول (المحل المقترح)', offerPriceILS: rashadi?.jewelerBuyPriceILS || 2690 },
    { id: '2', name: 'الصائغ الثاني', offerPriceILS: (rashadi?.jewelerBuyPriceILS ? rashadi.jewelerBuyPriceILS - 15 : 2675) }
  ]);

  // Selected coin details
  const activeSpec: SovereignCoinSpec = useMemo(() => {
    if (selectedCoinId === 'rashadi' && rashadi) return rashadi.spec;
    if (selectedCoinId === 'english' && english) return english.spec;
    return {
      id: 'custom',
      nameAr: 'ليرة بمواصفات مخصصة',
      subtitleAr: `${customWeight} غرام · عيار ${customKarat}`,
      standardWeightGrams: customWeight,
      karat: customKarat,
      purityFraction: customKarat / 24,
      pureGoldGrams: Number((customWeight * (customKarat / 24)).toFixed(3)),
      descriptionAr: 'ليرة بوزن أو عيار مخصص أدخله المستخدم.',
      historicalOriginAr: 'إدخال يدوي مخصص.',
      standardMarkingAr: 'يرجى فحص الدمغة لدى الصائغ'
    };
  }, [selectedCoinId, rashadi, english, customWeight, customKarat]);

  const activeSovereign = selectedCoinId === 'rashadi' ? rashadi : selectedCoinId === 'english' ? english : null;

  // Metal reference value
  const karatRefGramPrice = useMemo(() => {
    if (activeSpec.karat === 24) return data.karats['karat_24']?.referencePriceILS || 442;
    if (activeSpec.karat === 22) return data.karats['karat_22']?.referencePriceILS || 405;
    if (activeSpec.karat === 21) return data.karats['karat_21']?.referencePriceILS || 388;
    if (activeSpec.karat === 18) return data.karats['karat_18']?.referencePriceILS || 332;
    // Calculate proportionally from 24k
    const g24 = data.karats['karat_24']?.referencePriceILS || 442;
    return g24 * (activeSpec.karat / 24);
  }, [activeSpec.karat, data.karats]);

  const pureMeltValue = useMemo(() => {
    return Number((karatRefGramPrice * activeSpec.standardWeightGrams).toFixed(1));
  }, [karatRefGramPrice, activeSpec.standardWeightGrams]);

  // Buy Mode Calculations
  const buyCalculation = useMemo(() => {
    const quote = parseFloat(quotedSellPrice) || activeSovereign?.jewelerSellPriceILS || pureMeltValue;
    const isUserQuote = Boolean(quotedSellPrice && parseFloat(quotedSellPrice) > 0);
    const extra = parseFloat(extraExpenses) || 0;
    const totalCost = quote + extra;
    const diffFromMelt = totalCost - pureMeltValue;
    const marginPercent = pureMeltValue > 0 ? (diffFromMelt / pureMeltValue) * 100 : 0;

    return {
      quote,
      isUserQuote,
      extra,
      totalCost,
      diffFromMelt,
      marginPercent,
      publishedRef: activeSovereign?.jewelerSellPriceILS ?? null
    };
  }, [quotedSellPrice, activeSovereign, pureMeltValue, extraExpenses]);

  // Sell Mode Calculations
  const bestOffer = useMemo(() => {
    if (jewelerOffers.length === 0) return null;
    return [...jewelerOffers].sort((a, b) => b.offerPriceILS - a.offerPriceILS)[0];
  }, [jewelerOffers]);

  const sellProfitCalc = useMemo(() => {
    if (!bestOffer) return null;
    const original = parseFloat(originalBuyPrice);
    if (!original || isNaN(original) || original <= 0) return null;
    const netGain = bestOffer.offerPriceILS - original;
    const gainPct = (netGain / original) * 100;
    return {
      original,
      netGain,
      gainPct,
      isProfit: netGain >= 0
    };
  }, [bestOffer, originalBuyPrice]);

  const addJewelerOffer = () => {
    const nextNum = jewelerOffers.length + 1;
    setJewelerOffers([
      ...jewelerOffers,
      { id: Date.now().toString(), name: `الصائغ رقم ${nextNum}`, offerPriceILS: activeSovereign?.jewelerBuyPriceILS || 2680 }
    ]);
  };

  const updateJewelerOffer = (id: string, field: 'name' | 'offerPriceILS', val: string) => {
    setJewelerOffers(jewelerOffers.map(o => {
      if (o.id !== id) return o;
      if (field === 'name') return { ...o, name: val };
      return { ...o, offerPriceILS: parseFloat(val) || 0 };
    }));
  };

  const removeJewelerOffer = (id: string) => {
    if (jewelerOffers.length <= 1) return;
    setJewelerOffers(jewelerOffers.filter(o => o.id !== id));
  };

  // Helper for status badge
  const renderStatusBadge = (status: string, isCalc: boolean) => {
    if (isCalc) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
          تقدير محسوب من النشرة
        </span>
      );
    }
    if (status === 'current') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
          حديث ومعلن رسمياً
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        أرشيف مسجل
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-amber-100">
            <Coins className="w-4 h-4 text-amber-200" />
            <span>لوحة المتابعة التخصصية لليرات الذهب في فلسطين</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            أسعار الليرة الرشادي والليرة الإنجليزي في سوق فلسطين
          </h1>
          <p className="text-sm text-amber-100/90 leading-relaxed">
            متابعة دقيقة ومستقلة لأسعار الشراء والبيع الميدانية لليرات الذهب الأكثر تداولاً في محافظات الضفة الغربية والقدس وغزة، مع الفصل الصارم بين سعر بيع الصائغ للزبون وسعر شرائه منه، والمقارنة مع القيمة المرجعية الصافية لكمية الذهب.
          </p>
        </div>
      </div>

      {/* Part 1: Two Hero Cards for Rashadi and English Sovereigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: الليرة الرشادي */}
        {rashadi ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shadow-xs">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {rashadi.nameAr}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                        عيار 21 · 7.20 غرام
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {rashadi.spec.subtitleAr}
                    </p>
                  </div>
                </div>

                <div>
                  {renderStatusBadge(rashadi.status, rashadi.isTheoreticalEstimate)}
                </div>
              </div>

              {/* Prices Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
                {/* 1. سعر بيع الصائغ للزبون */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    سعر شراء الزبون (بيع الصائغ)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {rashadi.jewelerSellPriceILS !== null ? `${rashadi.jewelerSellPriceILS.toLocaleString()} ₪` : 'غير متاح من المصدر'}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    السعر المطلوب عند شرائك ليرة
                  </span>
                </div>

                {/* 2. سعر شراء الصائغ من الزبون */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block mb-1">
                    سعر بيع الزبون (شراء الصائغ)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
                    {rashadi.jewelerBuyPriceILS !== null ? `${rashadi.jewelerBuyPriceILS.toLocaleString()} ₪` : 'غير متاح من المصدر'}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    المبلغ الذي يدفع لك الصائغ
                  </span>
                </div>

                {/* 3. السعر المرجعي لكمية الذهب الصافي */}
                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    السعر المرجعي المنشور (الذهب فقط)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 font-mono">
                    {rashadi.referenceMeltValueILS.toLocaleString()} ₪
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    يعادل {rashadi.referenceMeltValueJOD} دينار أردني
                  </span>
                </div>
              </div>

              {/* Trends & Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">التغير خلال 24 ساعة</span>
                  <span className={`font-mono font-bold inline-flex items-center gap-1 ${
                    (rashadi.change24hILS || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {(rashadi.change24hILS || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {(rashadi.change24hILS || 0) >= 0 ? `+${rashadi.change24hILS}` : rashadi.change24hILS} ₪
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تغير آخر 7 أيام</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {(rashadi.change7dPercent || 0) >= 0 ? `+${rashadi.change7dPercent}%` : `${rashadi.change7dPercent}%`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تغير آخر 30 يوماً</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {(rashadi.change30dPercent || 0) >= 0 ? `+${rashadi.change30dPercent}%` : `${rashadi.change30dPercent}%`}
                  </span>
                </div>
              </div>

              {/* Spread & Advisory */}
              {rashadi.spreadILS !== null && (
                <div className="mt-3 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-lg">
                  <span>هامش الفرق بين البيع والشراء (Spread):</span>
                  <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                    {rashadi.spreadILS} ₪ لكل ليرة
                  </span>
                </div>
              )}
            </div>

            {/* Source & Metadata Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span>المصدر الموثق:</span>
                <a
                  href={rashadi.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{rashadi.source.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span>تاريخ آخر تحديث:</span>
                <span className="font-mono">{new Date(rashadi.source.publicationTimestamp || data.timestamp).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Card 2: الليرة الإنجليزي */}
        {english ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shadow-xs">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {english.nameAr}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                        عيار 22 · 8.00 غرام
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {english.spec.subtitleAr}
                    </p>
                  </div>
                </div>

                <div>
                  {renderStatusBadge(english.status, english.isTheoreticalEstimate)}
                </div>
              </div>

              {/* Prices Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
                {/* 1. سعر بيع الصائغ للزبون */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    سعر شراء الزبون (بيع الصائغ)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {english.jewelerSellPriceILS !== null ? `${english.jewelerSellPriceILS.toLocaleString()} ₪` : 'غير متاح من المصدر'}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    السعر المطلوب عند شرائك ليرة
                  </span>
                </div>

                {/* 2. سعر شراء الصائغ من الزبون */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block mb-1">
                    سعر بيع الزبون (شراء الصائغ)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
                    {english.jewelerBuyPriceILS !== null ? `${english.jewelerBuyPriceILS.toLocaleString()} ₪` : 'غير متاح من المصدر'}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    المبلغ الذي يدفع لك الصائغ
                  </span>
                </div>

                {/* 3. السعر المرجعي لكمية الذهب الصافي */}
                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    السعر المرجعي المنشور (الذهب فقط)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 font-mono">
                    {english.referenceMeltValueILS.toLocaleString()} ₪
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    يعادل {english.referenceMeltValueJOD} دينار أردني
                  </span>
                </div>
              </div>

              {/* Trends & Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">التغير خلال 24 ساعة</span>
                  <span className={`font-mono font-bold inline-flex items-center gap-1 ${
                    (english.change24hILS || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {(english.change24hILS || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {(english.change24hILS || 0) >= 0 ? `+${english.change24hILS}` : english.change24hILS} ₪
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تغير آخر 7 أيام</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {(english.change7dPercent || 0) >= 0 ? `+${english.change7dPercent}%` : `${english.change7dPercent}%`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تغير آخر 30 يوماً</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {(english.change30dPercent || 0) >= 0 ? `+${english.change30dPercent}%` : `${english.change30dPercent}%`}
                  </span>
                </div>
              </div>

              {/* Spread & Advisory */}
              {english.spreadILS !== null && (
                <div className="mt-3 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-lg">
                  <span>هامش الفرق بين البيع والشراء (Spread):</span>
                  <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                    {english.spreadILS} ₪ لكل ليرة
                  </span>
                </div>
              )}
            </div>

            {/* Source & Metadata Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span>المصدر الموثق:</span>
                <a
                  href={english.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{english.source.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span>تاريخ آخر تحديث:</span>
                <span className="font-mono">{new Date(english.source.publicationTimestamp || data.timestamp).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Part 2: Definition and Specifications of Gold Sovereigns (تعريف نوع الليرة) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              المواصفات القياسية المعتمدة لليرات الذهب في فلسطين
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لا تفترض أن جميع الليرات لها الوزن أو العيار نفسه؛ اعتمد المواصفات الموثقة وافحص دمغة الصاغة الرسمية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rashadi Specs */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                الليرة الرشادي (العثمانية)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                عيار 21 (875)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">الوزن القياسي الكامل</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">7.20 غرام</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">وزن الذهب الخالص النقي</span>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400">6.30 غرام ذهب صافي</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">نسبة النقاء الرسمية</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">87.5% (875 بالألف)</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">الدمغة الإلزامية</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">دمغة نقابة الصاغة 21</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">تنويه التدقيق:</span> توجد أيضاً فئات نصف رشادي (3.60 غرام) وربع رشادي (1.80 غرام). في حال كانت الليرة تاريخية مسكوكة في دار السكة العثمانية القديمة (تزن 7.216غ عيار 22)، يُطلب من الصائغ فحصها بدقة وعدم احتسابها عيار 21 إذا كانت من العيار القديم.
            </p>
          </div>

          {/* English Specs */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                الليرة الإنجليزي (السيادية / Sovereign)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                عيار 22 (916.7)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">الوزن القياسي الكامل</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">8.00 غرام (7.988غ)</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">وزن الذهب الخالص النقي</span>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400">7.333 غرام ذهب صافي</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">نسبة النقاء الرسمية</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">91.67% (916 بالألف)</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">الدمغة والرسومات</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">رسمة جورج أو التاج الملكي</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">تنويه التدقيق:</span> توجد فئة نصف إنجليزي تزن 4.00 غرام بعيار 22. تأكد دائماً أن الصائغ يزن الليرة أمامك على ميزان معاير إلى جزأين من المئة، للتأكد من عدم تآكل حوافها أو فقدانها للوزن.
            </p>
          </div>
        </div>
      </div>

      {/* Part 3: Specialized Sovereign Buy & Sell Calculator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                حاسبة الليرات الذهب (مقارنة الشراء والبيع)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                احسب القيمة الدقيقة، وقارن عروض محلات الصاغة بالسعر المرجعي الحقيقي بدون أي مبالغة أو رسوم مخفية
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCalcMode('buy')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                calcMode === 'buy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              شراء ليرة من الصائغ
            </button>
            <button
              onClick={() => setCalcMode('sell')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                calcMode === 'sell'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              بيع ليرة للصائغ ومقارنة العروض
            </button>
          </div>
        </div>

        {/* Coin Selection Pill Tabs */}
        <div className="mt-6 mb-6">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            اختر نوع الليرة أو حدد مواصفات خاصة:
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedCoinId('rashadi')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                selectedCoinId === 'rashadi'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">الليرة الرشادي</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">7.20 غرام · عيار 21</div>
            </button>

            <button
              onClick={() => setSelectedCoinId('english')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                selectedCoinId === 'english'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">الليرة الإنجليزي</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">8.00 غرام · عيار 22</div>
            </button>

            <button
              onClick={() => setSelectedCoinId('custom')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                selectedCoinId === 'custom'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">ليرة مخصصة (نصف/ربع)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">تحديد وزن وعيار يدوي</div>
            </button>
          </div>

          {/* Custom Weight and Karat Inputs if custom selected */}
          {selectedCoinId === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/80 dark:border-amber-900/40">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  الوزن الفعلي على الميزان (غرام):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                  placeholder="مثال: 3.60"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  العيار:
                </label>
                <select
                  value={customKarat}
                  onChange={(e) => setCustomKarat(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                >
                  <option value={24}>عيار 24 (999.9 نقي)</option>
                  <option value={22}>عيار 22 (916.7 إنجليزي)</option>
                  <option value={21}>عيار 21 (875 رشادي)</option>
                  <option value={18}>عيار 18 (750)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* MODE 1: شراء ليرة من الصائغ (Buy Mode) */}
        {calcMode === 'buy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    عرض السعر المطلوب من الصائغ لليرة الكاملة (شيكل ILS):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={quotedSellPrice}
                      onChange={(e) => setQuotedSellPrice(e.target.value)}
                      placeholder={activeSovereign?.jewelerSellPriceILS ? `السعر المنشور: ${activeSovereign.jewelerSellPriceILS} ₪` : 'أدخل السعر المطلوب من الصائغ'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-base focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">
                      شيكل ₪
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                    {quotedSellPrice ? (
                      <span className="text-blue-600 dark:text-blue-400 font-bold">سعر أدخله المستخدم للمقارنة</span>
                    ) : (
                      <span>إذا ترك فارغاً سيتم اعتماد السعر المنشور رسمياً بنشرة الصاغة ({activeSovereign?.jewelerSellPriceILS || pureMeltValue} ₪)</span>
                    )}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    أي مصاريف أو رسوم إضافية منفصلة (إن وجدت):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={extraExpenses}
                      onChange={(e) => setExtraExpenses(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                      placeholder="0"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold">
                      شيكل ₪
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    تشمل مثلاً كلفة علبة فاخرة أو رسوم فحص إضافية. الليرات عادة لا يُفرض عليها أي مصاريف إضافية فوق سعر الليرة.
                  </span>
                </div>
              </div>

              {/* Output Results */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    نتيجة مقارنة عرض الشراء
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {buyCalculation.totalCost.toLocaleString()} ₪
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      إجمالي التكلفة المتوقعة
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/80 pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">القيمة المرجعية الصافية للذهب فقط:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {pureMeltValue.toLocaleString()} ₪
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">سعر الليرة المنشور بنقابة الصاغة:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {buyCalculation.publishedRef ? `${buyCalculation.publishedRef.toLocaleString()} ₪` : 'غير متاح'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">علاوة الصائغ فوق قيمة الذهب الخام (هامش السك):</span>
                    <span className={`font-mono font-bold ${
                      buyCalculation.diffFromMelt <= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      +{buyCalculation.diffFromMelt.toFixed(1)} ₪ ({buyCalculation.marginPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">تقييم العرض: </span>
                  {buyCalculation.marginPercent <= 4 ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">عرض ممتاز وعادل جداً. هامش الصائغ يقع ضمن الحدود الطبيعية المتعارف عليها في سوق فلسطين.</span>
                  ) : buyCalculation.marginPercent <= 8 ? (
                    <span className="text-amber-700 dark:text-amber-400 font-bold">عرض مقبول ولكن أعلى قليلاً من السعر التأشيري. يمكنك الاستفسار لدى صائغ آخر لمقارنة السعر.</span>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-400 font-bold">تنبيه: العرض مرتفع بشكل ملحوظ عن القيمة المرجعية ونشرة الصاغة. تأكد من سبب الزيادة.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: بيع ليرة للصائغ ومقارنة عروض متعددة (Sell Mode) */}
        {calcMode === 'sell' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Offers Input */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    عروض محلات الصاغة لشراء ليرتك منك:
                  </label>
                  <button
                    onClick={addJewelerOffer}
                    className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة عرض صائغ آخر</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {jewelerOffers.map((offer, idx) => (
                    <div
                      key={offer.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shadow-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={offer.name}
                          onChange={(e) => updateJewelerOffer(offer.id, 'name', e.target.value)}
                          className="w-full text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none focus:outline-hidden"
                          placeholder="اسم المحل"
                        />
                      </div>
                      <div className="w-36 relative">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={offer.offerPriceILS}
                          onChange={(e) => updateJewelerOffer(offer.id, 'offerPriceILS', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm font-bold text-left"
                        />
                        <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">₪</span>
                      </div>
                      {jewelerOffers.length > 1 && (
                        <button
                          onClick={() => removeJewelerOffer(offer.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          title="حذف هذا العرض"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Optional Original Purchase Price for Profit calculation */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    سعر الشراء الأصلي (اختياري - لحساب صافي الربح أو الخسارة):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={originalBuyPrice}
                      onChange={(e) => setOriginalBuyPrice(e.target.value)}
                      placeholder="أدخل السعر الذي اشتريت به الليرة سابقاً"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold">شيكل ₪</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">قاعدة بيع الليرات في فلسطين:</strong> لا يجوز للصائغ خصم أي مبالغ تحت بند «مصنعية» عند شراء الليرة الذهبية من الزبون، لأن الليرات أصول ادخارية قياسية وليست مشغولات مرصعة. الخصم الوحيد المبرر يكون فقط إذا كان هناك نقص في الوزن الفعلي عن الوزن القياسي.
                  </span>
                </div>
              </div>

              {/* Right Column: Comparative Results */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    أفضل عرض شراء متاح لك
                  </span>
                  {bestOffer ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
                          {bestOffer.offerPriceILS.toLocaleString()} ₪
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          صافي المبلغ المستلم
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        مقدم من: {bestOffer.name}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Profit/Loss comparison */}
                {sellProfitCalc && (
                  <div className={`p-3.5 rounded-xl border ${
                    sellProfitCalc.isProfit
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}>
                    <span className="text-xs font-bold block mb-1">
                      {sellProfitCalc.isProfit ? 'صافي الربح المحقق:' : 'صافي الخسارة:'}
                    </span>
                    <div className="text-xl font-black font-mono">
                      {sellProfitCalc.isProfit ? `+${sellProfitCalc.netGain.toFixed(1)} ₪` : `${sellProfitCalc.netGain.toFixed(1)} ₪`}
                      <span className="text-xs font-normal mr-2">
                        ({sellProfitCalc.isProfit ? `+${sellProfitCalc.gainPct.toFixed(1)}%` : `${sellProfitCalc.gainPct.toFixed(1)}%`})
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/80 pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">سعر شراء الصائغ المنشور رسمياً:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {activeSovereign?.jewelerBuyPriceILS ? `${activeSovereign.jewelerBuyPriceILS.toLocaleString()} ₪` : 'غير متاح'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">قيمة الذهب الصافي المرجعي:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {pureMeltValue.toLocaleString()} ₪
                    </span>
                  </div>

                  {bestOffer && activeSovereign?.jewelerBuyPriceILS && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">الفرق بين أفضل عرض وسعر النشرة:</span>
                      <span className={`font-mono font-bold ${
                        bestOffer.offerPriceILS >= activeSovereign.jewelerBuyPriceILS
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {(bestOffer.offerPriceILS - activeSovereign.jewelerBuyPriceILS) >= 0 ? '+' : ''}
                        {(bestOffer.offerPriceILS - activeSovereign.jewelerBuyPriceILS).toFixed(1)} ₪
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part 6: Market Reading & Decision Assistant (قراءة السوق ومساعد قرار الشراء والبيع) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              قراءة السوق ومساعد قرار الشراء والبيع لليرات الذهب
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تحليل الاتجاه اللحظي، وتقييم مستويات الأسعار، ونصائح للتعامل مع محلات الصاغة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Market Direction Assessment */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>اتجاه حركة السعر الحالية</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">الحالة الإحصائية للمسار:</span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                {(rashadi?.change24hILS || 0) >= 0 ? 'اتجاه صاعد مدعوم بالأسواق العالمية' : 'تصحيح هابط مؤقت'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تتحرك أسعار الليرات في السوق الفلسطيني بارتباط وثيق مع سعر أونصة الذهب في بورصة نيويورك (COMEX) وسعر صرف الدولار مقابل الشيكل. التغير خلال الـ 7 أيام الأخيرة يعكس مساراً {(rashadi?.change7dPercent || 0) >= 0 ? 'إيجابياً' : 'مائلاً للاستقرار'}.
            </p>
          </div>

          {/* 2. Position in Range (Near Highs/Lows) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>موقع السعر من النطاق الشهري</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">التقييم النسبي للمستويات:</span>
              <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                قريب من القمم التاريخية الحديثة
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              سعر أونصة الذهب الدولية يتداول فوق 4,200$ مما يضع أسعار الليرات الرشادي والإنجليزي بالقرب من قمتها السنوية. للمدخرين على المدى الطويل، يُفضل اعتماد استراتيجية الشراء المجزأ (DCA) بدلاً من الشراء بمبلغ كامل دفعة واحدة.
            </p>
          </div>

          {/* 3. Goldsmith Pro Tips (إرشادات الصاغة) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>إرشادات التعامل مع محلات الصاغة</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>طلب وزن الليرة أمامك:</strong> تأكد أن وزن الرشادي 7.20غ بالضبط وأن الإنجليزي 8.00غ.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>السؤال في 3 محلات على الأقل:</strong> هوامش الشراء والبيع تختلف بين صائغ وآخر بفارق 15 - 30 شيكل.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>طلب فاتورة رسمية مفصلة:</strong> يجب أن تتضمن نوع الليرة والوزن الدقيق والسعر وتاريخ الشراء.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
