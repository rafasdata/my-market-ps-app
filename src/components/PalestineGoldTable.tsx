import React, { useState } from 'react';
import { MarketSnapshot, LocalJewelerBulletin, NewBulletinInput } from '../types/market';
import {
  Coins,
  ShieldAlert,
  PlusCircle,
  ExternalLink,
  Info,
  Calendar,
  CheckCircle2,
  FileCheck,
  Building2,
  Clock,
  ArrowRightLeft,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PalestineGoldTableProps {
  data: MarketSnapshot;
  onSaveBulletin: (bulletin: NewBulletinInput) => Promise<void>;
}

export const PalestineGoldTable: React.FC<PalestineGoldTableProps> = ({
  data,
  onSaveBulletin
}) => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    cityAr: 'رام الله والبيرة ومحافظات الضفة',
    bulletinSource: 'نشرة نقابة أصحاب محلات تجارة وصياغة الذهب الفلسطينية',
    sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
    gold21kSellILS: '',
    gold21kBuyILS: '',
    gold21kScrapBuyILS: '',
    gold24kSellILS: '',
    gold24kBuyILS: '',
    gold22kSellILS: '',
    gold22kBuyILS: '',
    gold18kSellILS: '',
    gold18kBuyILS: '',
    verifiedBy: 'توثيق نشرة نقابة الصاغة',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityAr || !formData.gold21kSellILS || !formData.bulletinSource) return;
    setIsSubmitting(true);
    try {
      await onSaveBulletin({
        date: new Date().toISOString().slice(0, 10),
        city: formData.cityAr,
        cityAr: formData.cityAr,
        bulletinSource: formData.bulletinSource,
        sourceUrl: formData.sourceUrl,
        publicationTimestamp: new Date().toISOString(),
        status: 'current',
        gold21kSellILS: parseFloat(formData.gold21kSellILS),
        gold21kBuyILS: formData.gold21kBuyILS ? parseFloat(formData.gold21kBuyILS) : null,
        gold21kScrapBuyILS: formData.gold21kScrapBuyILS ? parseFloat(formData.gold21kScrapBuyILS) : null,
        gold24kSellILS: formData.gold24kSellILS ? parseFloat(formData.gold24kSellILS) : null,
        gold24kBuyILS: formData.gold24kBuyILS ? parseFloat(formData.gold24kBuyILS) : null,
        gold22kSellILS: formData.gold22kSellILS ? parseFloat(formData.gold22kSellILS) : null,
        gold22kBuyILS: formData.gold22kBuyILS ? parseFloat(formData.gold22kBuyILS) : null,
        gold18kSellILS: formData.gold18kSellILS ? parseFloat(formData.gold18kSellILS) : null,
        gold18kBuyILS: formData.gold18kBuyILS ? parseFloat(formData.gold18kBuyILS) : null,
        verifiedBy: formData.verifiedBy,
        notes: formData.notes
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowAddModal(false);
        setFormData({
          cityAr: 'رام الله والبيرة ومحافظات الضفة',
          bulletinSource: 'نشرة نقابة أصحاب محلات تجارة وصياغة الذهب الفلسطينية',
          sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
          gold21kSellILS: '',
          gold21kBuyILS: '',
          gold21kScrapBuyILS: '',
          gold24kSellILS: '',
          gold24kBuyILS: '',
          gold22kSellILS: '',
          gold22kBuyILS: '',
          gold18kSellILS: '',
          gold18kBuyILS: '',
          verifiedBy: 'توثيق نشرة نقابة الصاغة',
          notes: ''
        });
      }, 1000);
    } catch (err) {
      alert('تعذر حفظ النشرة: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const karatsList = [21, 24, 22, 18, 14] as const;

  return (
    <div className="space-y-8">
      {/* Educational Banner on the 4 Distinct Price Categories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              الفصل الصارم بين أسعار بيع وشراء الذهب في فلسطين (معايير الشفافية المالية)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              امتثالاً لأعلى معايير الدقة والأمانة، لا يتم اختلاق أي سعر أو استنتاج سعر الشراء من سعر البيع أو افتراض هوامش ربح وهمية. يتم عرض كل سعر في خانته المعتمدة فقط مع رابط المصدر الأصلي وطابع النشر.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Category 1 */}
          <div className="bg-emerald-50/60 dark:bg-slate-950/80 p-3.5 rounded-lg border border-emerald-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>1. سعر بيع الصائغ للزبون</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              السعر المنشور رسمياً الذي يدفعه الزبون عند شراء الذهب من الصائغ (وفق نشرة نقابة الصاغة الفلسطينية بدون المصنعية).
            </p>
          </div>

          {/* Category 2 */}
          <div className="bg-rose-50/60 dark:bg-slate-950/80 p-3.5 rounded-lg border border-rose-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>2. سعر شراء الصائغ من الزبون</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              السعر الذي يدفعه الصائغ للزبون عند شراء الذهب منه. لا يتم استنتاجه أبداً من سعر البيع، بل يظهر فقط إذا نشرته النقابة صراحة.
            </p>
          </div>

          {/* Category 3 */}
          <div className="bg-indigo-50/60 dark:bg-slate-950/80 p-3.5 rounded-lg border border-indigo-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>3. سعر شراء الذهب المستعمل</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              سعر شراء الذهب الكسر أو المستعمل، يظهر فقط عند نشره صراحة في النشرة الرسمية، وإلا يُكتب "غير متاح من المصدر".
            </p>
          </div>

          {/* Category 4 */}
          <div className="bg-amber-50/60 dark:bg-slate-950/80 p-3.5 rounded-lg border border-amber-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>4. السعر المرجعي المنشور</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              سعر مشتق من أونصة الذهب العالمية (COMEX Spot) المحولة للشيكل بسعر الصرف المباشر. لا يحدد بيعاً أو شراءً.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table: Separated Buy, Sell, Scrap, and Reference Prices */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>جدول أسعار الذهب المفصل في فلسطين (بيع وشراء ومرجعي)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              قيم فورية بالجرام (ILS) مع توثيق اسم ومصدر وتاريخ كل قراءة بدقة
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>تاريخ الرصد:</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{data.latestObservationDate}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                <th className="py-3 px-3">العيار والنطاق الجغرافي</th>
                <th className="py-3 px-3 text-left">
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold">سعر بيع الصائغ للزبون</div>
                  <div className="text-[10px] text-slate-500 font-normal">نشرة النقابة (دون مصنعية)</div>
                </th>
                <th className="py-3 px-3 text-left">
                  <div className="text-rose-700 dark:text-rose-400 font-bold">سعر شراء الصائغ من الزبون</div>
                  <div className="text-[10px] text-slate-500 font-normal">نشرة النقابة الرسمية</div>
                </th>
                <th className="py-3 px-3 text-left">
                  <div className="text-indigo-700 dark:text-indigo-400 font-bold">شراء الذهب المستعمل</div>
                  <div className="text-[10px] text-slate-500 font-normal">كسر / مستعمل موثق</div>
                </th>
                <th className="py-3 px-3 text-left">
                  <div className="text-amber-700 dark:text-amber-400 font-bold">السعر المرجعي المنشور</div>
                  <div className="text-[10px] text-slate-500 font-normal">بورصة COMEX × الصرف</div>
                </th>
                <th className="py-3 px-3">المصدر والحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {karatsList.map((k) => {
                const item = data.karats[`karat_${k}`];
                if (!item) return null;
                const isBenchmark = k === 21;

                return (
                  <tr
                    key={k}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isBenchmark ? 'bg-amber-500/5 font-medium' : ''
                    }`}
                  >
                    {/* Karat & Scope */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>عيار {k}</span>
                        {isBenchmark && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                            العيار القياسي في فلسطين
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.geographicScopeAr} · نقاء {((item.purity) * 100).toFixed(1)}%
                      </div>
                    </td>

                    {/* Jeweler Sell Price */}
                    <td className="py-3.5 px-3 text-left font-mono" dir="ltr">
                      {item.jewelerSellPriceILS !== null ? (
                        <div>
                          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                            {item.jewelerSellPriceILS.toFixed(2)} ₪
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            نشرة النقابة
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                          غير متاح من المصدر
                        </span>
                      )}
                    </td>

                    {/* Jeweler Buy Price */}
                    <td className="py-3.5 px-3 text-left font-mono" dir="ltr">
                      {item.jewelerBuyPriceILS !== null ? (
                        <div>
                          <span className="text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                            {item.jewelerBuyPriceILS.toFixed(2)} ₪
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            نشرة النقابة
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                          غير متاح من المصدر
                        </span>
                      )}
                    </td>

                    {/* Scrap Buy Price */}
                    <td className="py-3.5 px-3 text-left font-mono" dir="ltr">
                      {item.scrapBuyPriceILS !== null ? (
                        <div>
                          <span className="text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                            {item.scrapBuyPriceILS.toFixed(2)} ₪
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            ذهب كسر مستعمل
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                          غير متاح من المصدر
                        </span>
                      )}
                    </td>

                    {/* Reference Price */}
                    <td className="py-3.5 px-3 text-left font-mono" dir="ltr">
                      {item.referencePriceILS !== null ? (
                        <div>
                          <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
                            {item.referencePriceILS.toFixed(2)} ₪
                          </span>
                          <span className="text-[10px] text-slate-500 block font-normal">
                            ({item.referencePriceJOD?.toFixed(2)} د.أ)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                          غير متاح
                        </span>
                      )}
                    </td>

                    {/* Source & Status */}
                    <td className="py-3.5 px-3">
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        {item.jewelerSellSource?.name || item.referenceSource.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {item.jewelerSellSource ? 'نشرة موثقة' : item.referenceSource.statusLabelAr}
                        </span>
                        <span>·</span>
                        <a
                          href={item.jewelerSellSource?.url || item.referenceSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          <span>المصدر الأصلي</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Comparison for 21K Benchmark & Key Karats */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>بطاقات التسعير الموثقة لعيارات الذهب (21K / 24K / 18K)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[21, 24, 18].map((k) => {
            const item = data.karats[`karat_${k}`];
            if (!item) return null;

            return (
              <div
                key={k}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xs hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      عيار {k} قيراط
                    </span>
                    {k === 21 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        الأساس
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.geographicScopeAr}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Sell Price */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">سعر بيع الصائغ للزبون:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm" dir="ltr">
                      {item.jewelerSellPriceILS !== null ? `${item.jewelerSellPriceILS.toFixed(2)} ₪` : 'غير متاح من المصدر'}
                    </span>
                  </div>

                  {/* Buy Price */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <span className="text-rose-800 dark:text-rose-300 font-medium">سعر شراء الصائغ من الزبون:</span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm" dir="ltr">
                      {item.jewelerBuyPriceILS !== null ? `${item.jewelerBuyPriceILS.toFixed(2)} ₪` : 'غير متاح من المصدر'}
                    </span>
                  </div>

                  {/* Scrap Price */}
                  {item.scrapBuyPriceILS !== null && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-indigo-800 dark:text-indigo-300 font-medium">سعر شراء المستعمل (الكسر):</span>
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm" dir="ltr">
                        {item.scrapBuyPriceILS.toFixed(2)} ₪
                      </span>
                    </div>
                  )}

                  {/* Reference Price */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <span className="text-amber-800 dark:text-amber-300 font-medium">السعر المرجعي المنشور:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm" dir="ltr">
                      {item.referencePriceILS !== null ? `${item.referencePriceILS.toFixed(2)} ₪` : 'غير متاح'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>المصدر:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                      {item.jewelerSellSource?.name || item.referenceSource.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تاريخ النشر:</span>
                    <span className="font-mono" dir="ltr">
                      {item.jewelerSellSource?.publicationTimestamp?.slice(0, 10) || data.latestObservationDate}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category 3: Registered Syndicate Bulletins Archive */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              <span>أرشيف نشرات نقابة أصحاب محلات الذهب الموثقة في محافظات فلسطين</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              نشرات ميدانية موثقة بتاريخ النشر والجهة المصدرة لمقارنة أسعار السوق الميداني مع البورصة
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل نشرة نقابة جديدة</span>
          </button>
        </div>

        {data.bulletins.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            لا توجد نشرات مسجلة حالياً. يمكنك إضافة نشرة نقابة معتمدة لمحافظتك.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.bulletins.map((b) => (
              <div key={b.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{b.cityAr}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.bulletinSource}</p>
                  </div>
                  <div className="text-left text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{b.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* 21k sell */}
                  <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">عيار 21 (بيع الزبون):</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-300 text-sm" dir="ltr">
                      {b.gold21kSellILS !== null ? `${b.gold21kSellILS.toFixed(1)} ₪` : 'غير متاح'}
                    </span>
                  </div>

                  {/* 21k buy */}
                  <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">عيار 21 (شراء من الزبون):</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-300 text-sm" dir="ltr">
                      {b.gold21kBuyILS !== null ? `${b.gold21kBuyILS.toFixed(1)} ₪` : 'غير متاح'}
                    </span>
                  </div>

                  {/* 21k scrap if available */}
                  {b.gold21kScrapBuyILS !== null && b.gold21kScrapBuyILS !== undefined && (
                    <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">عيار 21 (شراء الكسر):</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300 text-sm" dir="ltr">
                        {b.gold21kScrapBuyILS.toFixed(1)} ₪
                      </span>
                    </div>
                  )}

                  {/* 24k sell if available */}
                  {b.gold24kSellILS !== null && b.gold24kSellILS !== undefined && (
                    <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">عيار 24 (بيع):</span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-sm" dir="ltr">
                        {b.gold24kSellILS.toFixed(1)} ₪
                      </span>
                    </div>
                  )}

                  {/* 18k sell if available */}
                  {b.gold18kSellILS !== null && b.gold18kSellILS !== undefined && (
                    <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">عيار 18 (بيع):</span>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-300 text-sm" dir="ltr">
                        {b.gold18kSellILS.toFixed(1)} ₪
                      </span>
                    </div>
                  )}
                </div>

                {b.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/40 p-2 rounded border border-slate-200 dark:border-slate-800">
                    ملاحظة: {b.notes}
                  </p>
                )}

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between">
                  <span>التوثيق: {b.verifiedBy}</span>
                  <a
                    href={b.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>رابط النشرة الأصلية</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bulletin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                توثيق نشرة صاغة فلسطينية جديدة
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">المدينة أو المحافظة</label>
                  <input
                    type="text"
                    required
                    value={formData.cityAr}
                    onChange={(e) => setFormData({ ...formData, cityAr: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">مصدر النشرة / الجهة</label>
                  <input
                    type="text"
                    required
                    value={formData.bulletinSource}
                    onChange={(e) => setFormData({ ...formData, bulletinSource: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">رابط النشرة الأصلي (URL)</label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                    سعر بيع الصائغ عيار 21 (₪) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="مثال: 389"
                    value={formData.gold21kSellILS}
                    onChange={(e) => setFormData({ ...formData, gold21kSellILS: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-rose-700 dark:text-rose-400 font-bold mb-1">
                    سعر شراء الصائغ عيار 21 (₪)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 373"
                    value={formData.gold21kBuyILS}
                    onChange={(e) => setFormData({ ...formData, gold21kBuyILS: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-indigo-700 dark:text-indigo-400 font-bold mb-1">
                    سعر شراء المستعمل (₪)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 369"
                    value={formData.gold21kScrapBuyILS}
                    onChange={(e) => setFormData({ ...formData, gold21kScrapBuyILS: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">عيار 24 بيع (اختياري)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 444"
                    value={formData.gold24kSellILS}
                    onChange={(e) => setFormData({ ...formData, gold24kSellILS: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">عيار 18 بيع (اختياري)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 335"
                    value={formData.gold18kSellILS}
                    onChange={(e) => setFormData({ ...formData, gold18kSellILS: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">ملاحظات وشروط النشرة</label>
                <input
                  type="text"
                  placeholder="مثال: الأسعار المعتمدة في الضفة الغربية بدون مصنعية"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  {submitSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      <span>تم الحفظ والتحديث!</span>
                    </>
                  ) : (
                    <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ النشرة وتحديث الأسعار'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
