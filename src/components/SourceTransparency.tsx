import React from 'react';
import { SourceHealthCheck, MarketSnapshot } from '../types/market';
import {
  Layers,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Code,
  FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SourceTransparencyProps {
  sources: SourceHealthCheck[];
  lastRefresh: string;
}

export const SourceTransparency: React.FC<SourceTransparencyProps> = ({ sources, lastRefresh }) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              ميثاق الشفافية والنزاهة ومصادر البيانات المالية
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              تلتزم منصة <strong>"سوقي — فلسطين"</strong> بعدم اختلاق أو توليد أي أسعار أو أرقام وهمية إطلاقاً. كل رقم أو سعر معروض في المنصة مسترجع مباشرة من مزودات البيانات والبورصات العالمية الرسمية، ومقترن برابطه ومصدره وطابع وقته المحدد.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <div>
            <span>آخر فحص اتصال بالمزودات: </span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{lastRefresh}</span>
          </div>
          <div>
            <span>عدد المصادر النشطة: </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sources.length} مصادر رسمية</span>
          </div>
        </div>
      </div>

      {/* Sources Health & Providers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            قائمة مزودات البيانات والاتصال المباشر
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            يمكنك فحص الرابط المباشر والتحقق من البيانات بنفسك في أي وقت
          </p>
        </div>

        <div className="space-y-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    src.status === 'online' ? 'bg-emerald-500 animate-pulse' :
                    src.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{src.name}</h4>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                    {src.categoryAr}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    زمن الاستجابة: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{src.latencyMs} ms</span>
                  </span>
                  <a
                    href={src.homeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-sans font-semibold"
                  >
                    <span>زيارة المصدر</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">نوع البيانات المسترجعة:</span>
                  <p className="text-slate-800 dark:text-slate-300 font-medium">{src.dataTypeAr}</p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">القيود وساعات التحديث:</span>
                  <p className="text-slate-700 dark:text-slate-300">{src.limitationsAr}</p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">الترخيص والاعتماد:</span>
                  <p className="text-slate-700 dark:text-slate-300">{src.licenseAr}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-900 text-[10px] text-slate-500 font-mono flex flex-wrap items-center justify-between gap-2">
                <div className="truncate max-w-lg">
                  نقطة النهاية: <span className="text-slate-700 dark:text-slate-400">{src.endpointUrl}</span>
                </div>
                <div>
                  آخر جلب ناجح: <span className="text-slate-700 dark:text-slate-400">{src.lastSuccessfulFetch}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Equations & Conversions Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-500" />
            <span>معادلات التحويل الحسابية المعتمدة في المنصة</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تطبق المنصة المعايير الرياضية الدقيقة لتحويل أسعار الأونصة العالمية إلى أسعار الجرامات في فلسطين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-700 dark:text-amber-300 text-sm">
              معادلة حساب سعر جرام الذهب عيار 21 بالشيكل (ILS):
            </h4>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded font-mono text-[11px] text-amber-800 dark:text-amber-200 border border-slate-200 dark:border-slate-800" dir="ltr">
              Price_21K_ILS = (Spot_Ounce_USD / 31.1034768) * (21 / 24) * USD_ILS_Rate
            </div>
            <ul className="text-slate-600 dark:text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>1 أونصة تروي دولية = 31.1034768 جرام من الذهب الخالص (عيار 24).</li>
              <li>نسبة نقاء عيار 21 = 21 ÷ 24 = 87.5% (0.875).</li>
              <li>سعر صرف USD/ILS مسترجع لحظياً من سوق الصرف الدولي.</li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
              معادلة سعر صرف الدينار الأردني مقابل الشيكل (JOD/ILS):
            </h4>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded font-mono text-[11px] text-emerald-800 dark:text-emerald-200 border border-slate-200 dark:border-slate-800" dir="ltr">
              Rate_JOD_ILS = USD_ILS_Rate / 0.7090
            </div>
            <ul className="text-slate-600 dark:text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>الدينار الأردني مربوط رسمياً بالدولار الأمريكي بسعر 0.7090 دينار لكل دولار.</li>
              <li>1 دينار أردني = 1.4104 دولار أمريكي.</li>
              <li>يتحدد سعر الدينار مقابل الشيكل في السوق الفلسطيني مباشرة بحركة الدولار.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Status Legend / Glossary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          دليل حالات البيانات ومصطلحات الدقة المالية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">لحظي (Current):</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              بيانات متصلة بالبورصة مباشرة ومحدثة خلال آخر دقائق أثناء ساعات عمل التداول.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">مؤجل (Delayed):</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              بيانات جلسة إغلاق سابقة أو مؤجلة 15 دقيقة وفق سياسة البورصة الرسمية.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">محسوب رياضياً (Calculated):</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              رقم ناتج عن معادلة حسابية معلنة من أسعار سوقية فعلية، دون أي تدخل بشري أو تخمين.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">سعر مرجعي (Reference):</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              سعر تأشيري معلن من بنك مركزي أو سلطة النقد ولا يشمل عمولات التجزئة.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">غير متاح (Unavailable):</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              المزود غير متاح أو متوقف، ويتم إظهار رسالة واضحة بدلاً من ملء خانة وهمية.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-400 block mb-1">تاريخي (Historical):</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              سجل تم توثيقه وتخزينه في قاعدة البيانات للمقارنة مع الأيام السابقة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
