import React, { useState, useMemo } from 'react';
import { MarketSnapshot } from '../types/market';
import {
  Calculator,
  Coins,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info,
  AlertTriangle,
  ExternalLink,
  ArrowRightLeft,
  ShoppingBag,
  BadgePercent
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CraftsmanshipCalculatorProps {
  data: MarketSnapshot;
}

export const CraftsmanshipCalculator: React.FC<CraftsmanshipCalculatorProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [weightGrams, setWeightGrams] = useState<string>('15');
  const [selectedKarat, setSelectedKarat] = useState<24 | 22 | 21 | 18>(21);
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [sellSubtype, setSellSubtype] = useState<'jeweler_buy' | 'scrap_buy'>('jeweler_buy');
  const [workmanshipPerGram, setCraftsmanshipPerGram] = useState<number>(20);

  const usdIls = data.currencies.find(c => c.pair === 'USD/ILS')?.rate || 3.0599;
  const jodIls = data.currencies.find(c => c.pair === 'JOD/ILS')?.rate || 4.315;

  const karatData = data.karats[`karat_${selectedKarat}`];

  // Quick weight presets
  const weightPresets = [
    { label: 'خاتم / دبلة (4 جم)', weight: 4 },
    { label: 'سوار خفيف (10 جم)', weight: 10 },
    { label: 'طقم ذهب (25 جم)', weight: 25 },
    { label: 'أونصة (31.1 جم)', weight: 31.1035 },
    { label: 'سبيكة (50 جم)', weight: 50 },
  ];

  // Determine the exact source price to use based on transaction type
  const priceResolution = useMemo(() => {
    if (!karatData) return { price: 0, label: 'غير متاح', isReference: true, sourceName: '', sourceUrl: '' };

    if (transactionType === 'buy') {
      if (karatData.jewelerSellPriceILS !== null) {
        return {
          price: karatData.jewelerSellPriceILS,
          label: 'سعر بيع الصائغ المعتمد (نشرة نقابة الصاغة)',
          isReference: false,
          sourceName: karatData.jewelerSellSource?.name || 'نقابة الصاغة الفلسطينية',
          sourceUrl: karatData.jewelerSellSource?.url || 'https://www.facebook.com/gold.palestine.syndicate'
        };
      } else {
        return {
          price: karatData.referencePriceILS || 0,
          label: 'السعر المرجعي المنشور (محسوب من البورصة لعدم توفر سعر بيع رسمي للعيار)',
          isReference: true,
          sourceName: karatData.referenceSource.name,
          sourceUrl: karatData.referenceSource.url
        };
      }
    } else {
      // Selling to jeweler
      if (sellSubtype === 'scrap_buy' && karatData.scrapBuyPriceILS !== null) {
        return {
          price: karatData.scrapBuyPriceILS,
          label: 'سعر شراء الذهب المستعمل / الكسر (نشرة النقابة)',
          isReference: false,
          sourceName: karatData.scrapBuySource?.name || 'نقابة الصاغة الفلسطينية',
          sourceUrl: karatData.scrapBuySource?.url || 'https://www.facebook.com/gold.palestine.syndicate'
        };
      } else if (karatData.jewelerBuyPriceILS !== null) {
        return {
          price: karatData.jewelerBuyPriceILS,
          label: 'سعر شراء الصائغ من الزبون (نشرة نقابة الصاغة)',
          isReference: false,
          sourceName: karatData.jewelerBuySource?.name || 'نقابة الصاغة الفلسطينية',
          sourceUrl: karatData.jewelerBuySource?.url || 'https://www.facebook.com/gold.palestine.syndicate'
        };
      } else {
        return {
          price: karatData.referencePriceILS || 0,
          label: 'السعر المرجعي المنشور (تنبيه: سعر الشراء غير معلن من المصدر لهذا العيار)',
          isReference: true,
          sourceName: karatData.referenceSource.name,
          sourceUrl: karatData.referenceSource.url
        };
      }
    }
  }, [karatData, transactionType, sellSubtype]);

  const calculation = useMemo(() => {
    const weight = parseFloat(weightGrams) || 0;
    if (weight <= 0 || priceResolution.price <= 0) return null;

    const unitPriceILS = priceResolution.price;
    const metalValueILS = weight * unitPriceILS;
    const workmanshipUnit = transactionType === 'buy' ? Math.max(0, workmanshipPerGram) : 0;
    const workmanshipAmountILS = weight * workmanshipUnit;
    const estimatedTotalILS = metalValueILS + workmanshipAmountILS;

    const estimatedTotalJOD = jodIls > 0 ? estimatedTotalILS / jodIls : 0;
    const estimatedTotalUSD = usdIls > 0 ? estimatedTotalILS / usdIls : 0;

    return {
      weight,
      unitPriceILS,
      metalValueILS,
      workmanshipUnit,
      workmanshipAmountILS,
      estimatedTotalILS,
      estimatedTotalJOD,
      estimatedTotalUSD
    };
  }, [weightGrams, priceResolution, transactionType, workmanshipPerGram, jodIls, usdIls]);

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              حاسبة الصاغة التقديرية في فلسطين (معادلة المعدن والمصنعية)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              احسب القيمة التقديرية لقطعة الذهب بدقة مع الفصل الكامل بين قيمة المعدن الخام وأجرة الصياغة (المصنعية).
            </p>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5 leading-relaxed text-[11px]">
            <span className="font-bold">تنبيه قانوني ومصداقية مهنية:</span> هذه النتائج هي حسابات تقديرية استرشادية مبنية فقط على الأسعار المنشورة من المصادر الموثقة. لا تمثل بأي حال عرض أسعار نهائي أو ملزم من أي محل صاغة. لا تشمل الحسابات الضرائب أو الرسوم الإضافية ما لم ينص عليها مصدر رسمي معتمد.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
          {/* Step 1: Transaction Type (Buy or Sell) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              1. نوع المعاملة: هل أنت بصدد شراء أم بيع؟
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('buy')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  transactionType === 'buy'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>أنا أشتري ذهباً من الصائغ</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('sell')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  transactionType === 'sell'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>أنا أبيع ذهباً للصائغ</span>
              </button>
            </div>

            {transactionType === 'sell' && (
              <div className="mt-3 flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">حالة الذهب المباع:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="radio"
                    name="sellSubtype"
                    checked={sellSubtype === 'jeweler_buy'}
                    onChange={() => setSellSubtype('jeweler_buy')}
                    className="accent-amber-500"
                  />
                  <span>شراء اعتيادي من الزبون</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium mr-3">
                  <input
                    type="radio"
                    name="sellSubtype"
                    checked={sellSubtype === 'scrap_buy'}
                    onChange={() => setSellSubtype('scrap_buy')}
                    className="accent-amber-500"
                  />
                  <span>ذهب كسر / مستعمل (Scrap)</span>
                </label>
              </div>
            )}
          </div>

          {/* Step 2: Karat Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              2. اختر عيار الذهب:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[21, 24, 22, 18].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedKarat(k as any)}
                  className={`py-2.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedKarat === k
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                  }`}
                >
                  <div className="text-xs font-bold">عيار {k}</div>
                  <div className="text-[10px] opacity-80">
                    {k === 21 ? 'الأساس الفلسطيني' : k === 24 ? 'نقي 999.9' : k === 22 ? 'صياغة 916' : 'أبيض/مرصع'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Weight in Grams */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. الوزن بالجرام:
              </label>
              <span className="text-[11px] text-slate-500">أدخل الوزن الفعلي بالميزان</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="مثال: 15.5"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                جرام (g)
              </span>
            </div>

            {/* Weight Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {weightPresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setWeightGrams(p.weight.toString())}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[11px] rounded-md transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Workmanship Fee (Only if buying) */}
          {transactionType === 'buy' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>4. أجرة المصنعية التقديرية (شيكل للجرام):</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400" dir="ltr">
                  {workmanshipPerGram} ₪ / جم
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={workmanshipPerGram}
                onChange={(e) => setCraftsmanshipPerGram(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 ₪ (سبائك/خام)</span>
                <span>15 - 20 ₪ (محلي عادي)</span>
                <span>25 - 35 ₪ (كويتي/تركي)</span>
                <span>45+ ₪ (إيطالي فاخر)</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300">ملاحظة أمانة الصاغة عند البيع:</span> عند بيع الذهب للصائغ، يُشترى الذهب كوزن معدن خام فقط ولا تُدفع أي مصنعية للزبون (المصنعية = 0 ₪).
            </div>
          )}

          {/* Source Identification for the Selected Price */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">سعر الجرام المعتمد في الحسبة:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white" dir="ltr">
                {priceResolution.price.toFixed(2)} ₪
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">التصنيف:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {priceResolution.label}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400">المصدر:</span>
              <a
                href={priceResolution.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{priceResolution.sourceName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Calculation Result Breakdown Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  تفصيل الحسبة التقديرية
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                عيار {selectedKarat} ({calculation?.weight || 0} جم)
              </span>
            </div>

            {calculation ? (
              <div className="space-y-3.5 text-xs">
                {/* 1. Metal Value */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>1. قيمة المعدن الصافي:</span>
                    <span className="font-mono text-slate-300" dir="ltr">
                      {calculation.weight} جم × {calculation.unitPriceILS.toFixed(2)} ₪
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-200">صافي قيمة الذهب:</span>
                    <span className="font-mono text-lg font-extrabold text-amber-400" dir="ltr">
                      {calculation.metalValueILS.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                    </span>
                  </div>
                </div>

                {/* 2. Workmanship Amount */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>2. قيمة المصنعية الإجمالية:</span>
                    <span className="font-mono text-slate-300" dir="ltr">
                      {calculation.weight} جم × {calculation.workmanshipUnit} ₪
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-200">أجرة الصياغة:</span>
                    <span className="font-mono text-lg font-extrabold text-emerald-400" dir="ltr">
                      {calculation.workmanshipAmountILS.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                    </span>
                  </div>
                </div>

                {/* 3. Grand Estimated Total */}
                <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 space-y-2">
                  <div className="text-[11px] text-amber-300 font-semibold">
                    3. الإجمالي التقديري الكامل:
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white">المبلغ المقدر:</span>
                    <span className="font-mono text-2xl lg:text-3xl font-black text-amber-400" dir="ltr">
                      {calculation.estimatedTotalILS.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-200/90 font-mono" dir="ltr">
                    <span>≈ {calculation.estimatedTotalJOD.toFixed(2)} JOD (دينار)</span>
                    <span>≈ ${calculation.estimatedTotalUSD.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                أدخل الوزن لاحتساب القيمة التقديرية.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>مستبعد من الحسبة:</span>
            </div>
            <p className="leading-relaxed">
              تستبعد هذه الحسبة أي ضرائب مضافة أو رسوم دمغة أو تغليف خاص لم ينص عليها المصدر الرسمي صراحة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
