import React, { useState } from 'react';
import { MarketSnapshot, DailyReport } from '../types/market';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Copy,
  Printer,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DailyBriefingProps {
  data: MarketSnapshot;
  report: DailyReport | null;
  isLoadingReport: boolean;
  onGenerateReport: () => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  data,
  report,
  isLoadingReport,
  onGenerateReport
}) => {
  const { isDark } = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    if (!report) return;
    const text = `📊 تقرير سوقي اليومي — فلسطين (${report.date})
${report.headlineAr}

${report.summaryAr}

🔶 الذهب في فلسطين وعالمياً:
${report.goldAnalysisAr}

💵 العملات وأسواق الصرف:
${report.currenciesAnalysisAr}

🇵🇸 الأثر على السوق والمواطن في فلسطين:
${report.palestineImpactAr}

📌 الوقائع الرقمية المؤكدة:
${report.verifiedFacts.map(f => `• ${f}`).join('\n')}

⚠️ تنبيه الشفافية والمخاطر:
${report.disclaimerAr}
المصدر: تطبيق سوقي — فلسطين (My Market — Palestine)`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>النشرة والتقرير المالي اليومي لسوق فلسطين</span>
            </h2>
            {report?.isAiGenerated ? (
              <span className="text-[10px] bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>تحليل معزز بالذكاء الاصطناعي (Gemini)</span>
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>تحليل رياضي قطعي موثق</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تقرير تحليلي يومي يجمع بين حركة الأسعار الفعلية، وسياق الأخبار، والفصل التام بين الأرقام والتفسيرات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!report}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="نسخ التقرير لمشاركته عبر واتساب أو الرسائل"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copySuccess ? 'تم النسخ ✓' : 'نسخ النص'}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!report}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="طباعة التقرير"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>

          <button
            onClick={onGenerateReport}
            disabled={isLoadingReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReport ? 'animate-spin' : ''}`} />
            <span>{isLoadingReport ? 'جاري إعداد التقرير...' : 'تحديث التقرير الآن'}</span>
          </button>
        </div>
      </div>

      {isLoadingReport ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">جاري تحليل بيانات السوق وصياغة التقرير اليومي...</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            نقوم بجمع أحدث الأسعار ومطابقتها وتلخيص الأخبار الاقتصادية المسترجعة دون اختلاق أي بيانات.
          </p>
        </div>
      ) : report ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          {/* Report Headline & Metadata */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">تاريخ التقرير: {report.date}</span>
              <span className="font-mono">وقت التوليد: {report.generatedAt.slice(11, 19)} UTC</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {report.headlineAr}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
              {report.summaryAr}
            </p>
          </div>

          {/* Section 1: Gold Analysis */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span>1. حركة الذهب في فلسطين وعالمياً</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.goldAnalysisAr}
            </p>
          </div>

          {/* Section 2: Currencies Analysis */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
              <span>2. حركة العملات وأسعار الصرف (الدولار، الدينار، الشيكل)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.currenciesAnalysisAr}
            </p>
          </div>

          {/* Section 3: Impact on Palestine Market */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>3. الأثر المباشر على المواطن والسوق الفلسطيني</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.palestineImpactAr}
            </p>
          </div>

          {/* Section 4: Verified Facts Box (Rigid Separation) */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>الوقائع الرقمية المؤكدة قطيعاً في هذا التقرير:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              {report.verifiedFacts.map((fact, idx) => (
                <li key={idx} className="leading-relaxed">
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5: Uncertainties and Gaps (Transparent Disclosure) */}
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>الفجوات والمعلومات غير المؤكدة أو المقيدة:</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200/90 list-disc list-inside">
              {report.uncertaintiesAndGaps.map((gap, idx) => (
                <li key={idx} className="leading-relaxed">
                  {gap}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 6: Cited News Articles with Links */}
          {report.citedNews && report.citedNews.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300">
                المصادر الإخبارية الاقتصادية المستند إليها في التقرير:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.citedNews.map((news, idx) => (
                  <a
                    key={idx}
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">
                        {news.publisher} · {news.publishedAt.slice(0, 16)}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 line-clamp-2">
                        {news.title}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-900 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      <span>قراءة المقال الأصلي</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Disclaimer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>{report.disclaimerAr}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
