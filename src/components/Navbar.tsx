import React from 'react';
import { RefreshCw, Sun, Moon, Activity, BarChart3, Coins, CircleDollarSign, FileText, Calculator, Layers, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastRefresh: string;
  latestObservationDate: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  isStale: boolean;
  hasDegradedSources?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lastRefresh,
  latestObservationDate,
  isRefreshing,
  onRefresh,
  isStale,
  hasDegradedSources = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const currentDateAr = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const navItems = [
    { id: 'overview', label: 'لوحة السوق اليومية', icon: Activity },
    { id: 'sovereigns', label: 'الليرات (رشادي وإنجليزي)', icon: Coins },
    { id: 'gold', label: 'عيارات الذهب ونشرات الصاغة', icon: ShieldCheck },
    { id: 'currencies', label: 'العملات والتحويل', icon: CircleDollarSign },
    { id: 'charts', label: 'الرسوم البيانية الموثقة', icon: BarChart3 },
    { id: 'briefing', label: 'تقرير السوق اليومي', icon: FileText },
    { id: 'calculator', label: 'حاسبة الصاغة التقديرية', icon: Calculator },
    { id: 'transparency', label: 'تدقيق وموثوقية المصادر', icon: Layers },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur border-b transition-colors duration-200 ${
      isDark
        ? 'bg-slate-900/95 border-slate-800 shadow-md'
        : 'bg-white/95 border-slate-200 shadow-sm'
    }`}>
      {/* Top Banner with App Branding, Freshness & Live Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col md:flex-row md:items-center justify-between py-3 gap-3 border-b ${
          isDark ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold text-xl">
              س
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  سوقي — فلسطين
                </h1>
                <span className="text-xs text-amber-500 dark:text-amber-400 font-mono font-medium border border-amber-500/40 px-1.5 py-0.5 rounded">
                  MY MARKET PS
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                المنصة اليومية المستقلة لأسعار الذهب والعملات والأسواق في فلسطين مع الشفافية الكاملة
              </p>
            </div>
          </div>

          {/* Freshness, Observation Date, Theme Switcher & Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Feed Status Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium ${
              isStale || hasDegradedSources
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {isStale || hasDegradedSources ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isStale ? 'بيانات محفوظة (متأخرة)' : 'بعض المصادر متأخرة'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>جميع المزودات متصلة</span>
                </>
              )}
            </div>

            {/* Source Observation Date */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
              isDark
                ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>تاريخ النشر المعتمد:</span>
              <span className={`font-mono font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {latestObservationDate || '--'}
              </span>
            </div>

            {/* Last Refresh Time */}
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
              isDark
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>آخر استرجاع:</span>
              <span className={`font-mono font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`} dir="ltr">
                {lastRefresh || '--:--:--'}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 shadow-xs'
              }`}
              title={isDark ? 'التبديل إلى الوضع الفاتح (النهاري)' : 'التبديل إلى الوضع الداكن (الليلي)'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>فاتح</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>داكن</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="تحديث البيانات لحظياً من المزودات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar" aria-label="أقسام المنصة">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
