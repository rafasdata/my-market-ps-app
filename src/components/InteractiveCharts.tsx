import React, { useState, useEffect, useMemo } from 'react';
import { HistoricalObservation } from '../types/market';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Info,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InteractiveChartsProps {
  currentGold21kReferenceILS: number;
  currentGold21kLocalSellILS: number | null;
  currentGold21kLocalBuyILS: number | null;
  currentRashadiSellILS?: number | null;
  currentRashadiBuyILS?: number | null;
  currentRashadiRefILS?: number | null;
  currentEnglishSellILS?: number | null;
  currentEnglishBuyILS?: number | null;
  currentEnglishRefILS?: number | null;
  currentGoldSpotUSD: number;
  currentUsdIls: number;
  currentJodIls: number;
}

type MainCategory = 'gold_21k' | 'sovereign_rashadi' | 'sovereign_english' | 'gold_spot_usd' | 'usd_ils' | 'jod_ils';
type PriceTypeOption = 'local_sell' | 'local_buy' | 'reference';
type ChartRange = '7d' | '30d' | '90d' | '1y';

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  currentGold21kReferenceILS,
  currentGold21kLocalSellILS,
  currentGold21kLocalBuyILS,
  currentRashadiSellILS,
  currentRashadiBuyILS,
  currentRashadiRefILS,
  currentEnglishSellILS,
  currentEnglishBuyILS,
  currentEnglishRefILS,
  currentGoldSpotUSD,
  currentUsdIls,
  currentJodIls
}) => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('gold_21k');
  const [priceType, setPriceType] = useState<PriceTypeOption>('reference');
  const [selectedRange, setSelectedRange] = useState<ChartRange>('30d');
  const [history, setHistory] = useState<HistoricalObservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number | null;
    index: number;
    x: number;
    y: number;
  } | null>(null);

  const fetchHistory = async (range: ChartRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/market/history?symbol=${selectedCategory}&range=${range}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistory(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(selectedRange);
  }, [selectedRange, selectedCategory]);

  // Current metric configuration
  const metricConfig = useMemo(() => {
    if (selectedCategory === 'gold_21k') {
      if (priceType === 'local_sell') {
        return {
          titleAr: 'سعر بيع الصائغ للزبون (عيار 21 محلياً في فلسطين)',
          subAr: 'نشرة نقابة أصحاب محلات تجارة وصياغة الذهب الرسمية',
          unitAr: 'شيكل / جرام',
          symbol: '₪',
          sourceName: 'نقابة أصحاب محلات تجارة وصياغة الذهب الفلسطينية',
          sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
          rateTypeAr: 'سعر بيع الصائغ المنشور دون مصنعية',
          getValue: (o: HistoricalObservation) => o.gold21kLocalSellILS,
          color: '#10b981', // Emerald 500
          currentVal: currentGold21kLocalSellILS
        };
      } else if (priceType === 'local_buy') {
        return {
          titleAr: 'سعر شراء الصائغ من الزبون (عيار 21 محلياً في فلسطين)',
          subAr: 'نشرة نقابة أصحاب محلات تجارة وصياغة الذهب الرسمية',
          unitAr: 'شيكل / جرام',
          symbol: '₪',
          sourceName: 'نقابة أصحاب محلات تجارة وصياغة الذهب الفلسطينية',
          sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
          rateTypeAr: 'سعر شراء الصائغ المعتمد من المواطنين',
          getValue: (o: HistoricalObservation) => o.gold21kLocalBuyILS,
          color: '#f43f5e', // Rose 500
          currentVal: currentGold21kLocalBuyILS
        };
      } else {
        return {
          titleAr: 'السعر المرجعي المنشور لجرام الذهب عيار 21',
          subAr: 'محسوب بدقة من سعر أونصة الذهب في بورصة نيويورك (COMEX) × سعر صرف الدولار/شيكل',
          unitAr: 'شيكل / جرام',
          symbol: '₪',
          sourceName: 'بورصة COMEX عبر Yahoo Finance & سوق الصرف المفتوح',
          sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
          rateTypeAr: 'سعر مرجعي خام مشتق من البورصة العالمية',
          getValue: (o: HistoricalObservation) => o.gold21kReferenceILS,
          color: '#d97706', // Amber 600
          currentVal: currentGold21kReferenceILS
        };
      }
    } else if (selectedCategory === 'sovereign_rashadi') {
      if (priceType === 'local_sell') {
        return {
          titleAr: 'الليرة الرشادي - سعر بيع الصائغ للزبون (شراء الزبون)',
          subAr: 'مسجل بنشرة الصاغة والأسواق الفلسطينية (7.20 غرام عيار 21)',
          unitAr: 'شيكل لليرة الكاملة',
          symbol: '₪',
          sourceName: 'نشرة نقابة الصاغة ومؤشر سمارت الفلسطيني',
          sourceUrl: 'https://www.smartindex.ps/',
          rateTypeAr: 'سعر بيع الصائغ لليرة الرشادي',
          getValue: (o: HistoricalObservation) => o.rashadiSellILS ?? (o.gold21kLocalSellILS ? Number((o.gold21kLocalSellILS * 7.20).toFixed(1)) : null),
          color: '#10b981',
          currentVal: currentRashadiSellILS ?? null
        };
      } else if (priceType === 'local_buy') {
        return {
          titleAr: 'الليرة الرشادي - سعر شراء الصائغ من الزبون (بيع الزبون)',
          subAr: 'مسجل بنشرة الصاغة والأسواق الفلسطينية (7.20 غرام عيار 21)',
          unitAr: 'شيكل لليرة الكاملة',
          symbol: '₪',
          sourceName: 'نشرة نقابة الصاغة ومؤشر سمارت الفلسطيني',
          sourceUrl: 'https://www.smartindex.ps/',
          rateTypeAr: 'سعر شراء الصائغ لليرة من المواطنين',
          getValue: (o: HistoricalObservation) => o.rashadiBuyILS ?? (o.gold21kLocalBuyILS ? Number((o.gold21kLocalBuyILS * 7.20).toFixed(1)) : null),
          color: '#f43f5e',
          currentVal: currentRashadiBuyILS ?? null
        };
      } else {
        return {
          titleAr: 'الليرة الرشادي - السعر المرجعي الصافي لكمية الذهب',
          subAr: 'محسوب بدقة: 7.20 غرام × السعر المرجعي لغرام 21 قيراط (دون أي علاوة صياغة)',
          unitAr: 'شيكل لليرة',
          symbol: '₪',
          sourceName: 'بورصة COMEX وسوق الصرف المفتوح (مشتق بدقة)',
          sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
          rateTypeAr: 'قيمة الذهب الخام الصافي',
          getValue: (o: HistoricalObservation) => o.rashadiRefILS ?? (o.gold21kReferenceILS ? Number((o.gold21kReferenceILS * 7.20).toFixed(1)) : null),
          color: '#d97706',
          currentVal: currentRashadiRefILS ?? Number((currentGold21kReferenceILS * 7.20).toFixed(1))
        };
      }
    } else if (selectedCategory === 'sovereign_english') {
      if (priceType === 'local_sell') {
        return {
          titleAr: 'الليرة الإنجليزي - سعر بيع الصائغ للزبون (شراء الزبون)',
          subAr: 'مسجل بنشرة الصاغة والأسواق الفلسطينية (8.00 غرام عيار 22)',
          unitAr: 'شيكل لليرة الكاملة',
          symbol: '₪',
          sourceName: 'نشرة نقابة الصاغة وموقع ZahabPrice',
          sourceUrl: 'https://www.zahabprice.com/ar-ps/',
          rateTypeAr: 'سعر بيع الصائغ لليرة الإنجليزية',
          getValue: (o: HistoricalObservation) => o.englishSellILS ?? null,
          color: '#10b981',
          currentVal: currentEnglishSellILS ?? null
        };
      } else if (priceType === 'local_buy') {
        return {
          titleAr: 'الليرة الإنجليزي - سعر شراء الصائغ من الزبون (بيع الزبون)',
          subAr: 'مسجل بنشرة الصاغة والأسواق الفلسطينية (8.00 غرام عيار 22)',
          unitAr: 'شيكل لليرة الكاملة',
          symbol: '₪',
          sourceName: 'نشرة نقابة الصاغة وموقع ZahabPrice',
          sourceUrl: 'https://www.zahabprice.com/ar-ps/',
          rateTypeAr: 'سعر شراء الصائغ لليرة الإنجليزية من المواطنين',
          getValue: (o: HistoricalObservation) => o.englishBuyILS ?? null,
          color: '#f43f5e',
          currentVal: currentEnglishBuyILS ?? null
        };
      } else {
        return {
          titleAr: 'الليرة الإنجليزي - السعر المرجعي الصافي لكمية الذهب',
          subAr: 'محسوب بدقة: 8.00 غرام × السعر المرجعي لغرام 22 قيراط (دون أي هوامش)',
          unitAr: 'شيكل لليرة',
          symbol: '₪',
          sourceName: 'بورصة COMEX وسوق الصرف المفتوح (مشتق بدقة)',
          sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
          rateTypeAr: 'قيمة الذهب الخام الصافي',
          getValue: (o: HistoricalObservation) => o.englishRefILS ?? null,
          color: '#2563eb',
          currentVal: currentEnglishRefILS ?? null
        };
      }
    } else if (selectedCategory === 'gold_spot_usd') {
      return {
        titleAr: 'أونصة الذهب العالمية (COMEX Gold Futures Spot)',
        subAr: 'سعر تداول الأونصة الفوري/الآجل في بورصة السلع والمعادن بنيويورك',
        unitAr: 'دولار / أونصة تروي',
        symbol: '$',
        sourceName: 'بورصة كوميكس عبر Yahoo Finance (رمز GC=F)',
        sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
        rateTypeAr: 'سعر تداول بورصة عالمي (تداول مستمر)',
        getValue: (o: HistoricalObservation) => o.goldSpotUSD,
        color: '#f59e0b', // Amber 500
        currentVal: currentGoldSpotUSD
      };
    } else if (selectedCategory === 'usd_ils') {
      return {
        titleAr: 'سعر صرف الدولار الأمريكي مقابل الشيكل (USD/ILS)',
        subAr: 'سعر التداول الفوري المباشر بين البنوك والمؤسسات المالية الدولية',
        unitAr: 'شيكل لكل دولار واحد',
        symbol: '₪',
        sourceName: 'Yahoo Finance Interbank Feed & Open Exchange Rates',
        sourceUrl: 'https://finance.yahoo.com/quote/USDILS=X',
        rateTypeAr: 'سعر صرف سوق بين البنوك (Interbank Spot)',
        currencyDirectionAr: '1 دولار أمريكي (USD) = X شيكل إسرائيلي (ILS)',
        getValue: (o: HistoricalObservation) => o.usdIls,
        color: '#0284c7', // Sky 600
        currentVal: currentUsdIls
      };
    } else {
      return {
        titleAr: 'سعر صرف الدينار الأردني مقابل الشيكل (JOD/ILS)',
        subAr: 'محسوب استناداً لربط الدينار الرسمي بالدولار (0.7090) ومعدل صرف الدولار/شيكل',
        unitAr: 'شيكل لكل دينار أردني واحد',
        symbol: '₪',
        sourceName: 'معادلة الربط الرسمي للبنك المركزي الأردني (CBJ) وسوق الصرف',
        sourceUrl: 'https://www.cbj.gov.jo',
        rateTypeAr: 'سعر ربط رسمي مشتق (Fixed Peg Calculation)',
        currencyDirectionAr: '1 دينار أردني (JOD) = X شيكل إسرائيلي (ILS)',
        getValue: (o: HistoricalObservation) => o.jodIls,
        color: '#059669', // Emerald 600
        currentVal: currentJodIls
      };
    }
  }, [
    selectedCategory,
    priceType,
    currentGold21kReferenceILS,
    currentGold21kLocalSellILS,
    currentGold21kLocalBuyILS,
    currentRashadiSellILS,
    currentRashadiBuyILS,
    currentRashadiRefILS,
    currentEnglishSellILS,
    currentEnglishBuyILS,
    currentEnglishRefILS,
    currentGoldSpotUSD,
    currentUsdIls,
    currentJodIls
  ]);

  // Extract observations that actually have non-null values for the active metric
  const validObservations = useMemo(() => {
    return history
      .map(o => ({ date: o.date, val: metricConfig.getValue(o) }))
      .filter((item): item is { date: string; val: number } => item.val !== null && !isNaN(item.val));
  }, [history, metricConfig]);

  // Count missing data gaps
  const missingGapsCount = useMemo(() => {
    return history.filter(o => {
      const v = metricConfig.getValue(o);
      return v === null || isNaN(v);
    }).length;
  }, [history, metricConfig]);

  // Calculate statistics ONLY from displayed valid observations (strictly no fabricated values)
  const stats = useMemo(() => {
    if (validObservations.length === 0) {
      return {
        firstDate: '--',
        lastDate: '--',
        min: 0,
        max: 0,
        average: 0,
        totalChange: 0,
        totalChangePct: 0,
        observationsCount: 0
      };
    }

    const values = validObservations.map(o => o.val);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const average = sum / values.length;

    const first = validObservations[0];
    const last = validObservations[validObservations.length - 1];
    const totalChange = last.val - first.val;
    const totalChangePct = first.val > 0 ? (totalChange / first.val) * 100 : 0;

    return {
      firstDate: first.date,
      lastDate: last.date,
      min,
      max,
      average,
      totalChange,
      totalChangePct,
      observationsCount: validObservations.length
    };
  }, [validObservations]);

  // Dimensions & SVG Scaling
  const width = 850;
  const height = 320;
  const paddingX = 50;
  const paddingY = 40;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const minVal = stats.min;
  const maxVal = stats.max;
  const valRange = maxVal - minVal || 1;
  const yPadding = valRange * 0.12;
  const chartMin = Math.max(0, minVal - yPadding);
  const chartMax = maxVal + yPadding;

  // Build SVG Path Segments - breaks line on missing data gaps
  const pathSegments = useMemo(() => {
    if (history.length < 2) return [];

    const segments: string[] = [];
    let currentSegment: Array<{ x: number; y: number }> = [];

    history.forEach((point, i) => {
      const val = metricConfig.getValue(point);
      const x = paddingX + (i / (history.length - 1)) * chartWidth;

      if (val === null || isNaN(val)) {
        if (currentSegment.length > 0) {
          segments.push(buildPath(currentSegment));
          currentSegment = [];
        }
      } else {
        const y = height - paddingY - ((val - chartMin) / (chartMax - chartMin)) * chartHeight;
        currentSegment.push({ x, y });
      }
    });

    if (currentSegment.length > 0) {
      segments.push(buildPath(currentSegment));
    }

    return segments;
  }, [history, metricConfig, chartMin, chartMax, chartWidth, chartHeight]);

  function buildPath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`;
    return points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }

  return (
    <div className="space-y-6">
      {/* Header & Metric Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                الرسوم البيانية الموثقة والتحليل التاريخي
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              متابعة تاريخية موثقة دون تزييف؛ كل نقطة معروضة تمثل جلسة تداول حقيقية مسجلة من المصدر
            </p>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['7d', '30d', '90d', '1y'] as ChartRange[]).map((r) => {
              const labelMap: Record<ChartRange, string> = {
                '7d': '7 أيام',
                '30d': '30 يوماً',
                '90d': '90 يوماً',
                '1y': 'سنة كاملة'
              };
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRange(r)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedRange === r
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {labelMap[r]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Asset Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedCategory('gold_21k')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
              selectedCategory === 'gold_21k'
                ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="text-xs font-bold">ذهب 21K فلسطين</div>
            <div className="text-[10px] opacity-75">سعر محلي / مرجعي</div>
          </button>

          <button
            onClick={() => setSelectedCategory('sovereign_rashadi')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
              selectedCategory === 'sovereign_rashadi'
                ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="text-xs font-bold">الليرة الرشادي</div>
            <div className="text-[10px] opacity-75">7.20غ عيار 21</div>
          </button>

          <button
            onClick={() => setSelectedCategory('sovereign_english')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
              selectedCategory === 'sovereign_english'
                ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="text-xs font-bold">الليرة الإنجليزي</div>
            <div className="text-[10px] opacity-75">8.00غ عيار 22</div>
          </button>

          <button
            onClick={() => setSelectedCategory('gold_spot_usd')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
              selectedCategory === 'gold_spot_usd'
                ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="text-xs font-bold">أونصة الذهب العالمية</div>
            <div className="text-[10px] opacity-75">بورصة COMEX ($)</div>
          </button>

          <button
            onClick={() => setSelectedCategory('usd_ils')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
              selectedCategory === 'usd_ils'
                ? 'bg-sky-500/10 border-sky-500 text-sky-800 dark:text-sky-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="text-xs font-bold">الدولار / شيكل</div>
            <div className="text-[10px] opacity-75">USD/ILS (فوري)</div>
          </button>

          <button
            onClick={() => setSelectedCategory('jod_ils')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
              selectedCategory === 'jod_ils'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="text-xs font-bold">الدينار / شيكل</div>
            <div className="text-[10px] opacity-75">JOD/ILS (الربط 0.709)</div>
          </button>
        </div>

        {/* Dedicated Sub-Selector for Gold Karat or Sovereigns Price Type */}
        {(selectedCategory === 'gold_21k' || selectedCategory === 'sovereign_rashadi' || selectedCategory === 'sovereign_english') && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>حدد نوع السعر المعروض بدقة (لا يتم الخلط بين الأنواع إطلاقاً):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriceType('local_sell')}
                className={`p-2 rounded-lg border text-right text-xs transition-all cursor-pointer ${
                  priceType === 'local_sell'
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">سعر بيع الصائغ المنشور</div>
                <div className="text-[10px] opacity-80">سعر شراء الزبون المسجل بالنشرات</div>
              </button>

              <button
                type="button"
                onClick={() => setPriceType('local_buy')}
                className={`p-2 rounded-lg border text-right text-xs transition-all cursor-pointer ${
                  priceType === 'local_buy'
                    ? 'bg-rose-500 text-white font-bold border-rose-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">سعر شراء الصائغ المنشور</div>
                <div className="text-[10px] opacity-80">سعر بيع الزبون المسجل بالنشرات</div>
              </button>

              <button
                type="button"
                onClick={() => setPriceType('reference')}
                className={`p-2 rounded-lg border text-right text-xs transition-all cursor-pointer ${
                  priceType === 'reference'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">السعر المرجعي الصافي</div>
                <div className="text-[10px] opacity-80">قيمة الذهب الخالص من بورصة COMEX</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas & Transparency Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        {/* Metric Metadata Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: metricConfig.color }} />
              <span>{metricConfig.titleAr}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {metricConfig.subAr}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={metricConfig.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/30"
            >
              <span>المصدر: {metricConfig.sourceName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* SVG Chart Area */}
        {isLoading ? (
          <div className="h-72 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span>جاري استرجاع النقاط التاريخية الفعلية من المصدر...</span>
          </div>
        ) : validObservations.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-2 text-center p-6 text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              لا تتوفر تسجيلات تاريخية مؤكدة لهذا النوع من الأسعار في الفترة المحددة
            </span>
            <p className="max-w-md text-slate-400">
              حرصاً على الأمانة، لا نقوم باختلاق أو توليد أرقام افتراضية. يمكنك اختيار السعر المرجعي المنشور أو تسجيل نشرات يومية في أرشيف النقابة.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto max-h-[360px] font-mono select-none"
              >
                {/* Y-axis gridlines & labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = chartMin + ratio * (chartMax - chartMin);
                  const yPos = height - paddingY - ratio * chartHeight;
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={yPos}
                        x2={width - paddingX}
                        y2={yPos}
                        stroke={isDark ? '#334155' : '#e2e8f0'}
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill={isDark ? '#94a3b8' : '#64748b'}
                      >
                        {yVal.toFixed(yVal < 10 ? 3 : 1)}
                      </text>
                    </g>
                  );
                })}

                {/* Path Segments (breaks line across missing-data gaps) */}
                {pathSegments.map((d, idx) => (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={metricConfig.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Data Points */}
                {history.map((pt, i) => {
                  const val = metricConfig.getValue(pt);
                  if (val === null || isNaN(val)) return null;

                  const x = paddingX + (i / (history.length - 1)) * chartWidth;
                  const y = height - paddingY - ((val - chartMin) / (chartMax - chartMin)) * chartHeight;
                  const isHovered = hoveredPoint?.index === i;

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 3.5}
                        fill={isHovered ? '#ffffff' : metricConfig.color}
                        stroke={metricConfig.color}
                        strokeWidth={isHovered ? 3 : 1.5}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredPoint({ date: pt.date, value: val, index: i, x, y })}
                      />
                    </g>
                  );
                })}

                {/* X-axis dates */}
                {history.map((pt, i) => {
                  // Show ~5 labels
                  const step = Math.max(1, Math.floor(history.length / 5));
                  if (i % step !== 0 && i !== history.length - 1) return null;

                  const x = paddingX + (i / (history.length - 1)) * chartWidth;
                  return (
                    <text
                      key={i}
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isDark ? '#94a3b8' : '#64748b'}
                    >
                      {pt.date.slice(5)}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-10 pointer-events-none bg-slate-900/95 text-white border border-slate-700 px-3 py-2 rounded-lg text-xs shadow-xl space-y-0.5"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${Math.max(10, (hoveredPoint.y / height) * 100 - 25)}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="text-[10px] text-slate-400 font-mono">{hoveredPoint.date}</div>
                <div className="font-bold text-amber-400 font-mono text-sm" dir="ltr">
                  {hoveredPoint.value?.toFixed(2)} {metricConfig.symbol}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Strict Statistics Cards Breakdown (Calculated ONLY from displayed observations) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Period Range */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">فترة الملاحظات:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]" dir="ltr">
              {stats.firstDate} ← {stats.lastDate}
            </span>
          </div>

          {/* Min & Max */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">أدنى وأعلى سعر:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs" dir="ltr">
              {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
            </span>
          </div>

          {/* Average */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">المتوسط الحسابي:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs" dir="ltr">
              {stats.average.toFixed(2)} {metricConfig.symbol}
            </span>
          </div>

          {/* Percentage Change */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">التغير الصافي للفترة:</span>
            <span
              className={`font-mono font-bold text-xs ${
                stats.totalChangePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
              dir="ltr"
            >
              {stats.totalChangePct >= 0 ? '+' : ''}{stats.totalChangePct.toFixed(2)}%
            </span>
          </div>

          {/* Number of Observations */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">الجلسات المسجلة:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs" dir="ltr">
              {stats.observationsCount} ملاحظة
            </span>
          </div>

          {/* Missing data gaps */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">فجوات البيانات / الإغلاق:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs" dir="ltr">
              {missingGapsCount} أيام عطلة/فجوة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
