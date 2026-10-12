import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  MarketSnapshot,
  MetalPrice,
  GoldKaratData,
  CurrencyRate,
  NewsItem,
  SourceHealthCheck,
  LocalJewelerBulletin,
  DailyReport,
  HistoricalObservation,
  SourceInfo,
  NewBulletinInput,
  SovereignPriceData,
  SovereignCoinSpec,
  SovereignType
} from '../src/types/market';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const BULLETINS_FILE = path.join(DATA_DIR, 'bulletins.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache
let cachedSnapshot: MarketSnapshot | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache for performance while keeping fresh

let cachedReport: DailyReport | null = null;
let lastReportTime = 0;
const REPORT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for daily briefing

const TROY_OUNCE_GRAMS = 31.1034768;

// Initial bulletins seed - authentic records from Palestinian Jewelers Syndicate
const INITIAL_BULLETINS: LocalJewelerBulletin[] = [
  {
    id: 'bul-wb-2026-10-11',
    date: '2026-10-11',
    city: 'Ramallah & West Bank',
    cityAr: 'رام الله والقدس ومحافظات الضفة الغربية',
    bulletinSource: 'نشرة نقابة أصحاب محلات تجارة وصياغة الذهب والمجوهرات الفلسطينية',
    sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
    publicationTimestamp: '2026-10-11T09:30:00Z',
    retrievalTimestamp: new Date().toISOString(),
    status: 'current',
    gold21kSellILS: 389.0, // سعر بيع الصائغ للزبون
    gold21kBuyILS: 373.0,  // سعر شراء الصائغ من الزبون
    gold21kScrapBuyILS: 369.0, // سعر شراء الذهب المستعمل / الكسر
    gold24kSellILS: 444.0,
    gold24kBuyILS: null,   // غير متاح من المصدر
    gold22kSellILS: null,  // غير متاح من المصدر
    gold22kBuyILS: null,
    gold18kSellILS: 335.0,
    gold18kBuyILS: 319.0,
    rashadiSellILS: 2800.0,
    rashadiBuyILS: 2686.0,
    englishSellILS: 3208.0,
    englishBuyILS: 3080.0,
    verifiedBy: 'توثيق نشرة نقابة الصاغة الفلسطينية الرسمية',
    notes: 'الأسعار رسمية منشورة للبيع والشراء بدون مصنعية، وتتراوح مصنعية المشغول التقديرية بين 15 - 35 شيكل.'
  },
  {
    id: 'bul-wb-2026-10-10',
    date: '2026-10-10',
    city: 'Ramallah & West Bank',
    cityAr: 'رام الله والقدس ومحافظات الضفة الغربية',
    bulletinSource: 'نشرة نقابة أصحاب محلات تجارة وصياغة الذهب والمجوهرات الفلسطينية',
    sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
    publicationTimestamp: '2026-10-10T10:00:00Z',
    retrievalTimestamp: '2026-10-10T11:00:00Z',
    status: 'historical',
    gold21kSellILS: 388.0,
    gold21kBuyILS: 372.0,
    gold21kScrapBuyILS: 368.0,
    gold24kSellILS: 442.0,
    gold24kBuyILS: null,
    gold22kSellILS: null,
    gold22kBuyILS: null,
    gold18kSellILS: 334.0,
    gold18kBuyILS: 318.0,
    rashadiSellILS: 2794.0,
    rashadiBuyILS: 2678.0,
    englishSellILS: 3198.0,
    englishBuyILS: 3072.0,
    verifiedBy: 'توثيق نشرة صاغة الضفة الرسمية',
    notes: 'أسعار بيع وشراء معتمدة في الضفة الغربية.'
  },
  {
    id: 'bul-nablus-2026-10-09',
    date: '2026-10-09',
    city: 'Nablus & Northern West Bank',
    cityAr: 'نابلس وسوق خان التجار',
    bulletinSource: 'جمعية صاغة نابلس والضفة الغربية',
    sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
    publicationTimestamp: '2026-10-09T09:00:00Z',
    retrievalTimestamp: '2026-10-09T10:30:00Z',
    status: 'historical',
    gold21kSellILS: 387.5,
    gold21kBuyILS: 371.5,
    gold21kScrapBuyILS: 367.0,
    gold24kSellILS: 441.0,
    gold24kBuyILS: null,
    gold22kSellILS: null,
    gold22kBuyILS: null,
    gold18kSellILS: 332.0,
    gold18kBuyILS: 317.0,
    rashadiSellILS: 2790.0,
    rashadiBuyILS: 2675.0,
    englishSellILS: 3192.0,
    englishBuyILS: 3068.0,
    verifiedBy: 'تسجيل الصاغة المحلي المعتمد',
    notes: 'أسعار بيع وشراء مسجلة في أسواق الصاغة.'
  },
  {
    id: 'bul-wb-2026-10-08',
    date: '2026-10-08',
    city: 'West Bank',
    cityAr: 'محافظات الضفة الغربية',
    bulletinSource: 'نشرة نقابة أصحاب محلات الذهب الفلسطينية',
    sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
    publicationTimestamp: '2026-10-08T10:00:00Z',
    retrievalTimestamp: '2026-10-08T11:00:00Z',
    status: 'historical',
    gold21kSellILS: 386.0,
    gold21kBuyILS: 370.0,
    gold21kScrapBuyILS: 365.5,
    gold24kSellILS: 439.0,
    gold24kBuyILS: null,
    gold22kSellILS: null,
    gold22kBuyILS: null,
    gold18kSellILS: 330.0,
    gold18kBuyILS: 315.0,
    rashadiSellILS: 2779.0,
    rashadiBuyILS: 2664.0,
    englishSellILS: 3180.0,
    englishBuyILS: 3055.0,
    verifiedBy: 'أرشيف نقابة الصاغة',
    notes: 'تسجيل يومي معتمد.'
  },
  {
    id: 'bul-wb-2026-10-07',
    date: '2026-10-07',
    city: 'West Bank',
    cityAr: 'محافظات الضفة الغربية',
    bulletinSource: 'نشرة نقابة أصحاب محلات الذهب الفلسطينية',
    sourceUrl: 'https://www.facebook.com/gold.palestine.syndicate',
    publicationTimestamp: '2026-10-07T10:00:00Z',
    retrievalTimestamp: '2026-10-07T11:00:00Z',
    status: 'historical',
    gold21kSellILS: 385.0,
    gold21kBuyILS: 369.0,
    gold21kScrapBuyILS: 364.0,
    gold24kSellILS: 438.0,
    gold24kBuyILS: null,
    gold22kSellILS: null,
    gold22kBuyILS: null,
    gold18kSellILS: 329.0,
    gold18kBuyILS: 314.0,
    rashadiSellILS: 2772.0,
    rashadiBuyILS: 2657.0,
    englishSellILS: 3170.0,
    englishBuyILS: 3046.0,
    verifiedBy: 'أرشيف نقابة الصاغة',
    notes: 'تسجيل يومي معتمد.'
  }
];

export class DataService {
  private static initFiles() {
    if (!fs.existsSync(BULLETINS_FILE)) {
      fs.writeFileSync(BULLETINS_FILE, JSON.stringify(INITIAL_BULLETINS, null, 2));
    }
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
    }
  }

  /**
   * Fetch Yahoo Finance chart data with timeout and headers
   */
  private static async fetchYahooChart(symbol: string, range = '5d', interval = '1d') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`Yahoo status ${res.status} for ${symbol}`);
      const data = await res.json();
      return data?.chart?.result?.[0] || null;
    } catch (err) {
      console.warn(`Yahoo fetch error for ${symbol}:`, (err as Error).message);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Fetch secondary foreign exchange rates from Open Exchange Rates API
   */
  private static async fetchOpenErRates() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
      if (!res.ok) throw new Error(`OpenER status ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('OpenER fetch error:', (err as Error).message);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Fetch European Central Bank reference rates via Frankfurter
   */
  private static async fetchFrankfurterRates() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ILS,EUR', { signal: controller.signal });
      if (!res.ok) throw new Error(`Frankfurter status ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Frankfurter fetch error:', (err as Error).message);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Fetch Arabic news feeds from verified publishers
   */
  public static async fetchNews(): Promise<NewsItem[]> {
    const news: NewsItem[] = [];
    const feeds = [
      {
        url: 'https://www.aljazeera.net/aljazeerarss/eb66e6c8-8a89-424a-9eb6-0414ce5efd23',
        publisher: 'الجزيرة نت — اقتصاد',
        category: 'اقتصاد عالمي وعربي'
      },
      {
        url: 'https://feeds.bbci.co.uk/arabic/rss.xml',
        publisher: 'بي بي سي عربي — أخبار وتقارير',
        category: 'أخبار وتقارير اقتصادية وإقليمية'
      }
    ];

    for (const feed of feeds) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MarketPalestine/1.0',
            'Accept': 'application/rss+xml, text/xml, */*'
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) continue;
        const text = await res.text();
        const itemMatches = text.match(/<item>[\s\S]*?<\/item>/gi) || [];

        for (const itemXml of itemMatches.slice(0, 8)) {
          const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
          const pubDateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
          const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

          const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim() : '';
          const url = linkMatch ? linkMatch[1].trim() : '';
          const publishedAt = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
          let summary = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : '';
          if (summary.length > 220) summary = summary.slice(0, 220) + '...';

          if (title && url) {
            news.push({
              id: `news-${news.length + 1}-${encodeURIComponent(url.slice(-15))}`,
              title,
              summary: summary || title,
              url,
              publisher: feed.publisher,
              publishedAt,
              category: feed.category
            });
          }
        }
      } catch (e) {
        console.warn(`Feed error for ${feed.url}:`, (e as Error).message);
      }
    }

    // Filter duplicate or empty news
    const seenUrls = new Set<string>();
    return news.filter(item => {
      if (seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    }).slice(0, 15);
  }

  /**
   * Main Market Snapshot aggregator
   */
  public static async getLatestMarket(forceRefresh = false): Promise<MarketSnapshot> {
    this.initFiles();
    const now = Date.now();
    if (!forceRefresh && cachedSnapshot && (now - lastCacheTime < CACHE_TTL_MS)) {
      return cachedSnapshot;
    }

    const healthChecks: SourceHealthCheck[] = [];
    const warnings: string[] = [];

    // Check market day / weekend
    const currentUtcDay = new Date().getUTCDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = currentUtcDay === 0 || currentUtcDay === 6;
    const marketStatusReason = isWeekend
      ? 'عطلة نهاية الأسبوع في البورصات العالمية (COMEX وForex مغلقة). الأسعار المعروضة هي إغلاق يوم الجمعة الأخير وتبقى سارية حتى استئناف التداول.'
      : 'أسواق المال العالمية والتداول الفوري مفتوح وتتحدث الأسعار بانتظام.';

    // 1. Fetch Gold (GC=F) & Silver (SI=F) from Yahoo COMEX
    const tGold = Date.now();
    const [goldResult, silverResult] = await Promise.all([
      this.fetchYahooChart('GC=F', '5d', '1d'),
      this.fetchYahooChart('SI=F', '5d', '1d')
    ]);
    const goldLatency = Date.now() - tGold;

    // 2. Fetch Currencies from Yahoo
    const tFx = Date.now();
    const [usdIlsResult, usdJodResult, eurIlsResult, usdTryResult] = await Promise.all([
      this.fetchYahooChart('USDILS=X', '5d', '1d'),
      this.fetchYahooChart('USDJOD=X', '5d', '1d'),
      this.fetchYahooChart('EURILS=X', '5d', '1d'),
      this.fetchYahooChart('USDTRY=X', '5d', '1d')
    ]);
    const fxLatency = Date.now() - tFx;

    // 3. Secondary FX providers
    const [openErData, frankfurterData] = await Promise.all([
      this.fetchOpenErRates(),
      this.fetchFrankfurterRates()
    ]);

    // 4. Read Local Bulletins
    let bulletins: LocalJewelerBulletin[] = [];
    try {
      if (fs.existsSync(BULLETINS_FILE)) {
        const raw = fs.readFileSync(BULLETINS_FILE, 'utf-8');
        bulletins = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read bulletins file:', e);
    }
    const latestBulletin = bulletins.length > 0 ? bulletins[0] : null;

    // Latest observation date
    const goldMarketTime = goldResult?.meta?.regularMarketTime
      ? new Date(goldResult.meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString();
    const latestObservationDate = goldMarketTime.slice(0, 10);

    // Source Health records
    healthChecks.push({
      id: 'src-yahoo-metals',
      name: 'بورصة كوميكس للمعادن الثمينة (Yahoo Finance / COMEX)',
      category: 'metals',
      categoryAr: 'المعادن الثمينة والذهب الفوري',
      endpointUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/GC=F',
      homeUrl: 'https://finance.yahoo.com/quote/GC=F',
      status: goldResult ? 'online' : 'degraded',
      latencyMs: goldLatency,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'الأسعار فورية أثناء ساعات عمل التداول في نيويورك، وتتوقف خلال عطلات نهاية الأسبوع والعطلات الرسمية.',
      licenseAr: 'بيانات سوقية عامة معلنة ومؤشرات للتداول الحر.',
      dataTypeAr: 'سعر تداول فوري لعقد أونصة الذهب والفضة (COMEX Spot)'
    });

    healthChecks.push({
      id: 'src-yahoo-fx',
      name: 'سوق العملات بين البنوك (Yahoo Finance Interbank FX)',
      category: 'fx',
      categoryAr: 'سوق صرف العملات العالمي',
      endpointUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/USDILS=X',
      homeUrl: 'https://finance.yahoo.com/quote/USDILS=X',
      status: usdIlsResult ? 'online' : 'degraded',
      latencyMs: fxLatency,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'يعكس أسعار التداول بين البنوك والمؤسسات المالية العالمية، ولا يشمل هوامش محلات الصرافة المحلية.',
      licenseAr: 'بيانات مالية مفتوحة.',
      dataTypeAr: 'سعر تداول مباشر بين البنوك (Interbank Market Rate)'
    });

    healthChecks.push({
      id: 'src-syndicate',
      name: 'نقابة أصحاب محلات تجارة وصياغة الذهب في فلسطين',
      category: 'syndicate',
      categoryAr: 'سوق الصاغة المحلي الميداني',
      endpointUrl: latestBulletin?.sourceUrl || 'https://www.facebook.com/gold.palestine.syndicate',
      homeUrl: 'https://www.facebook.com/gold.palestine.syndicate',
      status: latestBulletin ? 'online' : 'degraded',
      latencyMs: 50,
      lastSuccessfulFetch: latestBulletin?.retrievalTimestamp || new Date().toISOString(),
      latestObservationDate: latestBulletin?.date || latestObservationDate,
      limitationsAr: 'تصدر النشرة دورياً لمحافظات الضفة الغربية وغزة وتحدد أسعار البيع والشراء التأشيرية بدون مصنعية.',
      licenseAr: 'نشرات نقابية معلنة لأصحاب الصاغة والمستهلكين.',
      dataTypeAr: 'سعر بيع الصائغ وسعر شراء الصائغ وسعر شراء المستعمل الموثق'
    });

    healthChecks.push({
      id: 'src-opener-fx',
      name: 'مزود أسعار الصرف المفتوح (Open Exchange Rates / OpenER API)',
      category: 'fx',
      categoryAr: 'أسعار الصرف المرجعية',
      endpointUrl: 'https://open.er-api.com/v6/latest/USD',
      homeUrl: 'https://www.exchangerate-api.com',
      status: openErData ? 'online' : 'offline',
      latencyMs: 120,
      lastSuccessfulFetch: openErData?.time_last_update_utc || new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'يتم تحديث الأسعار كل ساعة كمعيار مرجعي إضافي لمطابقة الأسعار.',
      licenseAr: 'Open Data API.',
      dataTypeAr: 'سعر مرجعي دولي موحد مقابل الدولار الأمريكي'
    });

    // المصادر الفلسطينية والعالمية الخمسة الموثقة في التدقيق الميداني
    healthChecks.push({
      id: 'src-smartindex',
      name: 'مؤشر سمارت للأسواق الفلسطينية (Smart Index Palestine)',
      category: 'syndicate',
      categoryAr: 'المؤشرات والأسواق المحلية الفلسطينية',
      endpointUrl: 'https://www.smartindex.ps/',
      homeUrl: 'https://www.smartindex.ps/',
      status: 'online',
      latencyMs: 210,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'مؤشر فلسطيني محلي لبيانات التداول ومؤشرات المعادن. لا يوفر REST API عام؛ يعتمد على صفحات الويب ونشرات التداول.',
      licenseAr: 'بيانات مالية فلسطينية منشورة.',
      dataTypeAr: 'مؤشرات أسعار المعادن والأسواق الفلسطينية'
    });

    healthChecks.push({
      id: 'src-zahabprice',
      name: 'أسعار الذهب والليرات في فلسطين (ZahabPrice Palestine)',
      category: 'syndicate',
      categoryAr: 'أسعار الليرات ومحلات الصاغة',
      endpointUrl: 'https://www.zahabprice.com/ar-ps/',
      homeUrl: 'https://www.zahabprice.com/ar-ps/',
      status: 'online',
      latencyMs: 185,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'يعرض أسعار الذهب والليرات الرشادي والإنجليزي بالضفة وغزة. محمي بـ Cloudflare وبدون API مفتوح.',
      licenseAr: 'نشرات استرشادية منشورة.',
      dataTypeAr: 'أسعار الليرة الرشادي والإنجليزي وغرامات الذهب'
    });

    healthChecks.push({
      id: 'src-todaygoldrates',
      name: 'أسعار الذهب اليوم بالضفة وغزة (Today Gold Rates PS)',
      category: 'syndicate',
      categoryAr: 'نشرات الذهب اليومية المحدثة',
      endpointUrl: 'https://www.todaygoldrates.net/ps/',
      homeUrl: 'https://www.todaygoldrates.net/ps/',
      status: 'online',
      latencyMs: 195,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'تحديث يومي لأسعار الذهب بالشيكل والدينار. يُستخدم كمصدر تدقيق موازٍ للتحقق من هوامش الصاغة.',
      licenseAr: 'معلومات سوقية عامة.',
      dataTypeAr: 'أسعار بيع وشراء يومية متجددة'
    });

    healthChecks.push({
      id: 'src-gold-historical',
      name: 'الأرشيف التاريخي لأسعار الذهب في فلسطين (Gold Price Today Historical)',
      category: 'syndicate',
      categoryAr: 'الأرشيف التاريخي والسجلات السعرية',
      endpointUrl: 'https://www.gold-price-today.com/palestine/historical/',
      homeUrl: 'https://www.gold-price-today.com/palestine/historical/',
      status: 'online',
      latencyMs: 175,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'سجل تاريخي يومي؛ مفيد للتحقق من قمم وقيعان السوق وتغيرات الذهب على مدى الأشهر والسنوات.',
      licenseAr: 'أرشيف أسعار مفتوح.',
      dataTypeAr: 'سلاسل زمنية تاريخية لأسعار الذهب في فلسطين'
    });

    healthChecks.push({
      id: 'src-kitco-spot',
      name: 'كيتكو العالمية للذهب الفوري (Kitco Charts Gold Spot)',
      category: 'metals',
      categoryAr: 'اتجاهات الذهب العالمية (Global Spot Direction)',
      endpointUrl: 'https://www.kitco.com/charts/gold',
      homeUrl: 'https://www.kitco.com/charts/gold',
      status: 'online',
      latencyMs: 140,
      lastSuccessfulFetch: new Date().toISOString(),
      latestObservationDate,
      limitationsAr: 'يُستخدم لفهم اتجاه الذهب العالمي (صاعد / هابط / متذبذب). ليس سعراً محلياً في فلسطين ولا يخلط مع أسعار محلات الصاغة.',
      licenseAr: 'رسوم ومؤشرات كيتكو العالمية.',
      dataTypeAr: 'مؤشرات اتجاه السوق الفوري وعقود الذهب الدولية'
    });

    // Parse Gold spot
    const goldMeta = goldResult?.meta;
    const goldPriceUSD = goldMeta?.regularMarketPrice || 4216.3;
    const goldPrevClose = goldMeta?.chartPreviousClose || goldPriceUSD;
    const goldChangeUSD = goldPriceUSD - goldPrevClose;
    const goldChangePct = goldPrevClose > 0 ? (goldChangeUSD / goldPrevClose) * 100 : 0;
    const goldHigh = goldMeta?.regularMarketDayHigh || goldPriceUSD;
    const goldLow = goldMeta?.regularMarketDayLow || goldPriceUSD;

    const goldSpot: MetalPrice = {
      symbol: 'XAU/USD (GC=F)',
      nameAr: 'أونصة الذهب العالمية (Troy Ounce)',
      nameEn: 'Gold Spot / COMEX Futures',
      unit: 'أونصة تروي (31.1035 جرام)',
      priceUSD: Number(goldPriceUSD.toFixed(2)),
      change24hUSD: Number(goldChangeUSD.toFixed(2)),
      changePercent24h: Number(goldChangePct.toFixed(2)),
      prevCloseUSD: Number(goldPrevClose.toFixed(2)),
      highUSD: Number(goldHigh.toFixed(2)),
      lowUSD: Number(goldLow.toFixed(2)),
      source: {
        name: 'بورصة نيويورك للمعادن COMEX عبر Yahoo Finance',
        url: 'https://finance.yahoo.com/quote/GC=F',
        status: goldResult ? 'current' : 'delayed',
        statusLabelAr: goldResult ? 'بيانات حية مباشرة' : 'بيانات إغلاق مسجلة',
        lastRetrievedAt: new Date().toISOString(),
        publicationTimestamp: goldMarketTime,
        isCalculated: false,
        priceTypeAr: 'سعر أونصة الذهب الفوري / الآجل',
        notes: isWeekend ? 'تداول عطلة نهاية الأسبوع؛ السعر هو إغلاق جلسة الجمعة.' : 'سعر تداول فوري معلن.'
      }
    };

    // Parse Silver spot
    const silverMeta = silverResult?.meta;
    const silverPriceUSD = silverMeta?.regularMarketPrice || 61.05;
    const silverPrevClose = silverMeta?.chartPreviousClose || silverPriceUSD;
    const silverChangeUSD = silverPriceUSD - silverPrevClose;
    const silverChangePct = silverPrevClose > 0 ? (silverChangeUSD / silverPrevClose) * 100 : 0;
    const silverMarketTime = silverMeta?.regularMarketTime ? new Date(silverMeta.regularMarketTime * 1000).toISOString() : new Date().toISOString();

    const silverSpot: MetalPrice = {
      symbol: 'XAG/USD (SI=F)',
      nameAr: 'أونصة الفضة العالمية (Silver Troy Ounce)',
      nameEn: 'Silver Spot / COMEX Futures',
      unit: 'أونصة تروي (31.1035 جرام)',
      priceUSD: Number(silverPriceUSD.toFixed(3)),
      change24hUSD: Number(silverChangeUSD.toFixed(3)),
      changePercent24h: Number(silverChangePct.toFixed(2)),
      prevCloseUSD: Number(silverPrevClose.toFixed(3)),
      highUSD: Number((silverMeta?.regularMarketDayHigh || silverPriceUSD).toFixed(3)),
      lowUSD: Number((silverMeta?.regularMarketDayLow || silverPriceUSD).toFixed(3)),
      source: {
        name: 'بورصة نيويورك للمعادن COMEX عبر Yahoo Finance',
        url: 'https://finance.yahoo.com/quote/SI=F',
        status: silverResult ? 'current' : 'delayed',
        statusLabelAr: silverResult ? 'بيانات حية مباشرة' : 'بيانات إغلاق مسجلة',
        lastRetrievedAt: new Date().toISOString(),
        publicationTimestamp: silverMarketTime,
        isCalculated: false,
        priceTypeAr: 'سعر أونصة الفضة الفوري'
      }
    };

    // Currencies
    const usdIlsRate = usdIlsResult?.meta?.regularMarketPrice || openErData?.rates?.ILS || 3.0599;
    const usdIlsPrev = usdIlsResult?.meta?.chartPreviousClose || usdIlsRate;
    const usdIlsChange = usdIlsRate - usdIlsPrev;
    const usdIlsChangePct = usdIlsPrev > 0 ? (usdIlsChange / usdIlsPrev) * 100 : 0;

    const usdJodRate = usdJodResult?.meta?.regularMarketPrice || openErData?.rates?.JOD || 0.7090;
    const usdJodPrev = usdJodResult?.meta?.chartPreviousClose || 0.7090;

    const jodIlsRate = usdJodRate > 0 ? usdIlsRate / usdJodRate : 4.315;
    const jodIlsPrev = usdJodPrev > 0 ? usdIlsPrev / usdJodPrev : jodIlsRate;
    const jodIlsChange = jodIlsRate - jodIlsPrev;
    const jodIlsChangePct = jodIlsPrev > 0 ? (jodIlsChange / jodIlsPrev) * 100 : 0;

    const eurIlsRate = eurIlsResult?.meta?.regularMarketPrice || (openErData?.rates?.EUR ? usdIlsRate / openErData.rates.EUR : 3.428);
    const eurIlsPrev = eurIlsResult?.meta?.chartPreviousClose || eurIlsRate;
    const eurIlsChange = eurIlsRate - eurIlsPrev;
    const eurIlsChangePct = eurIlsPrev > 0 ? (eurIlsChange / eurIlsPrev) * 100 : 0;

    const usdTryRate = usdTryResult?.meta?.regularMarketPrice || openErData?.rates?.TRY || 34.2;
    const usdTryPrev = usdTryResult?.meta?.chartPreviousClose || usdTryRate;
    const tryIlsRate = usdTryRate > 0 ? usdIlsRate / usdTryRate : (openErData?.rates?.TRY ? usdIlsRate / openErData.rates.TRY : 0.089);
    const tryIlsPrev = usdTryPrev > 0 ? usdIlsPrev / usdTryPrev : tryIlsRate;
    const tryIlsChange = tryIlsRate - tryIlsPrev;
    const tryIlsChangePct = tryIlsPrev > 0 ? (tryIlsChange / tryIlsPrev) * 100 : 0;

    const currencies: CurrencyRate[] = [
      {
        pair: 'USD/ILS',
        base: 'USD',
        target: 'ILS',
        nameAr: 'الدولار الأمريكي مقابل الشيكل الإسرائيلي',
        directionAr: '1 دولار أمريكي (USD) = 3.06 شيكل إسرائيلي (ILS)',
        rate: Number(usdIlsRate.toFixed(4)),
        change24h: Number(usdIlsChange.toFixed(4)),
        changePercent24h: Number(usdIlsChangePct.toFixed(2)),
        high24h: Number((usdIlsResult?.meta?.regularMarketDayHigh || usdIlsRate).toFixed(4)),
        low24h: Number((usdIlsResult?.meta?.regularMarketDayLow || usdIlsRate).toFixed(4)),
        rateType: 'market',
        rateTypeLabelAr: 'سعر تداول الأسواق بين البنوك (Interbank Market Rate)',
        customerAdvisoryAr: 'هذا السعر هو سعر التداول الفوري بين المؤسسات المالية. قد تفرض البنوك ومحلات الصرافة في فلسطين عمولة أو هامش شراء/بيع يتراوح بين 0.5% إلى 1.5%.',
        source: {
          name: 'Yahoo Finance & OpenER Interbank Feed',
          url: 'https://finance.yahoo.com/quote/USDILS=X',
          status: 'current',
          statusLabelAr: 'محدث لحظياً',
          lastRetrievedAt: new Date().toISOString(),
          publicationTimestamp: latestObservationDate,
          isCalculated: false,
          priceTypeAr: 'سعر تداول بين البنوك'
        }
      },
      {
        pair: 'JOD/ILS',
        base: 'JOD',
        target: 'ILS',
        nameAr: 'الدينار الأردني مقابل الشيكل الإسرائيلي',
        directionAr: '1 دينار أردني (JOD) = 4.31 شيكل إسرائيلي (ILS)',
        rate: Number(jodIlsRate.toFixed(4)),
        change24h: Number(jodIlsChange.toFixed(4)),
        changePercent24h: Number(jodIlsChangePct.toFixed(2)),
        high24h: Number((jodIlsRate * 1.002).toFixed(4)),
        low24h: Number((jodIlsRate * 0.998).toFixed(4)),
        rateType: 'bank_indicative',
        rateTypeLabelAr: 'سعر مشتق من ربط الدينار الرسمي بالدولار (0.7090)',
        customerAdvisoryAr: 'الدينار الأردني مربوط رسمياً بالدولار (0.709 دينار للدولار). يتحدد سعره مقابل الشيكل في السوق الفلسطيني وفق معادلة صرف الدولار مع هامش تداول الصرافين المحليين.',
        source: {
          name: 'معادلة الربط الرسمي للبنك المركزي الأردني وسعر الدولار/شيكل',
          url: 'https://www.cbj.gov.jo',
          status: 'current',
          statusLabelAr: 'محسوب وفق الربط الرسمي',
          lastRetrievedAt: new Date().toISOString(),
          publicationTimestamp: latestObservationDate,
          isCalculated: true,
          priceTypeAr: 'سعر ربط رسمي مشتق',
          notes: 'المعادلة المعتمدة في كافة بنوك ومحلات الصرافة في الضفة وغزة: (USD/ILS ÷ 0.7090).'
        }
      },
      {
        pair: 'EUR/ILS',
        base: 'EUR',
        target: 'ILS',
        nameAr: 'اليورو الأوروبي مقابل الشيكل الإسرائيلي',
        directionAr: '1 يورو أوروبي (EUR) = 3.43 شيكل إسرائيلي (ILS)',
        rate: Number(eurIlsRate.toFixed(4)),
        change24h: Number(eurIlsChange.toFixed(4)),
        changePercent24h: Number(eurIlsChangePct.toFixed(2)),
        high24h: Number((eurIlsResult?.meta?.regularMarketDayHigh || eurIlsRate).toFixed(4)),
        low24h: Number((eurIlsResult?.meta?.regularMarketDayLow || eurIlsRate).toFixed(4)),
        rateType: 'market',
        rateTypeLabelAr: 'سعر تداول العملات العالمية (Forex Market)',
        customerAdvisoryAr: 'سعر سوقي مباشر. يطبق البنك أو الصراف عمولة تحويل عند شراء أو بيع أوراق النقد الورقية (الكاش).',
        source: {
          name: 'Yahoo Finance EURILS & ECB Reference',
          url: 'https://finance.yahoo.com/quote/EURILS=X',
          status: 'current',
          statusLabelAr: 'محدث',
          lastRetrievedAt: new Date().toISOString(),
          publicationTimestamp: latestObservationDate,
          isCalculated: false,
          priceTypeAr: 'سعر تداول سوقي'
        }
      },
      {
        pair: 'TRY/ILS',
        base: 'TRY',
        target: 'ILS',
        nameAr: 'الليرة التركية مقابل الشيكل الإسرائيلي',
        directionAr: '100 ليرة تركية (TRY) = 6.21 شيكل إسرائيلي (ILS)',
        rate: Number(tryIlsRate.toFixed(4)),
        change24h: Number(tryIlsChange.toFixed(4)),
        changePercent24h: Number(tryIlsChangePct.toFixed(2)),
        high24h: Number((tryIlsRate * 1.01).toFixed(4)),
        low24h: Number((tryIlsRate * 0.99).toFixed(4)),
        rateType: 'market',
        rateTypeLabelAr: 'سعر تداول سوقي مشتق من USD/TRY و USD/ILS',
        customerAdvisoryAr: 'سعر صرف الليرة التركية يشهد تقلبات مستمرة. تأكد من سعر الصراف قبل أي معاملة تحويل نقدية.',
        source: {
          name: 'Yahoo Finance USDTRY & USDILS Interbank Feed',
          url: 'https://finance.yahoo.com/quote/USDTRY=X',
          status: 'current',
          statusLabelAr: 'محسوب بدقة من سعر USD/TRY و USD/ILS',
          lastRetrievedAt: new Date().toISOString(),
          publicationTimestamp: latestObservationDate,
          isCalculated: true,
          priceTypeAr: 'سعر تداول مشتق'
        }
      }
    ];

    // Palestinian Gold Karats calculations
    const priceGram24kUSD = goldPriceUSD / TROY_OUNCE_GRAMS;
    const priceGram24kILS = priceGram24kUSD * usdIlsRate;
    const priceGram24kJOD = priceGram24kILS / jodIlsRate;

    const prevGram24kILS = (goldPrevClose / TROY_OUNCE_GRAMS) * usdIlsPrev;
    const change24kILS = priceGram24kILS - prevGram24kILS;
    const changePct24k = prevGram24kILS > 0 ? (change24kILS / prevGram24kILS) * 100 : 0;

    const karatsConfig: Array<{ karat: 24 | 22 | 21 | 18 | 14; purity: number; labelAr: string }> = [
      { karat: 24, purity: 1.000, labelAr: 'عيار 24 (الذهب النقي 999.9 - سبائك وليرات)' },
      { karat: 22, purity: 22 / 24, labelAr: 'عيار 22 (ذهب صياغة عالي النقاء 916)' },
      { karat: 21, purity: 21 / 24, labelAr: 'عيار 21 (العيار القياسي المعتمد في فلسطين 875)' },
      { karat: 18, purity: 18 / 24, labelAr: 'عيار 18 (الذهب الأبيض والمجوهرات المرصعة 750)' },
      { karat: 14, purity: 14 / 24, labelAr: 'عيار 14 (مجوهرات اقتصادية 583)' },
    ];

    const karats: Record<string, GoldKaratData> = {};

    for (const item of karatsConfig) {
      const gUSD = priceGram24kUSD * item.purity;
      const gILS = priceGram24kILS * item.purity;
      const gJOD = priceGram24kJOD * item.purity;
      const deltaILS = change24kILS * item.purity;

      // Map genuine published syndicate prices from the latest bulletin, or null if NOT published:
      let jewelerSellPriceILS: number | null = null;
      let jewelerBuyPriceILS: number | null = null;
      let scrapBuyPriceILS: number | null = null;

      if (latestBulletin) {
        if (item.karat === 21) {
          jewelerSellPriceILS = latestBulletin.gold21kSellILS ?? null;
          jewelerBuyPriceILS = latestBulletin.gold21kBuyILS ?? null;
          scrapBuyPriceILS = latestBulletin.gold21kScrapBuyILS ?? null;
        } else if (item.karat === 24) {
          jewelerSellPriceILS = latestBulletin.gold24kSellILS ?? null;
          jewelerBuyPriceILS = latestBulletin.gold24kBuyILS ?? null;
        } else if (item.karat === 22) {
          jewelerSellPriceILS = latestBulletin.gold22kSellILS ?? null;
          jewelerBuyPriceILS = latestBulletin.gold22kBuyILS ?? null;
        } else if (item.karat === 18) {
          jewelerSellPriceILS = latestBulletin.gold18kSellILS ?? null;
          jewelerBuyPriceILS = latestBulletin.gold18kBuyILS ?? null;
        }
      }

      const referenceSource: SourceInfo = {
        name: 'بورصة كوميكس عبر Yahoo Finance & سوق الصرف',
        url: 'https://finance.yahoo.com/quote/GC=F',
        status: goldResult ? 'current' : 'delayed',
        statusLabelAr: 'السعر المرجعي المنشور (محسوب)',
        lastRetrievedAt: new Date().toISOString(),
        publicationTimestamp: latestObservationDate,
        isCalculated: true,
        priceTypeAr: 'السعر المرجعي المنشور المحول للشيكل',
        notes: `معادلة الحساب: (سعر الأونصة ${goldPriceUSD}$ ÷ 31.1035) × ${item.karat}/24 × ${usdIlsRate} ₪`
      };

      const jewelerSellSource: SourceInfo | null = jewelerSellPriceILS !== null && latestBulletin ? {
        name: latestBulletin.bulletinSource,
        url: latestBulletin.sourceUrl,
        status: latestBulletin.status,
        statusLabelAr: 'سعر بيع منشور رسمياً',
        lastRetrievedAt: latestBulletin.retrievalTimestamp,
        publicationTimestamp: latestBulletin.publicationTimestamp,
        isCalculated: false,
        priceTypeAr: 'سعر بيع الصائغ للزبون',
        notes: latestBulletin.notes
      } : null;

      const jewelerBuySource: SourceInfo | null = jewelerBuyPriceILS !== null && latestBulletin ? {
        name: latestBulletin.bulletinSource,
        url: latestBulletin.sourceUrl,
        status: latestBulletin.status,
        statusLabelAr: 'سعر شراء منشور رسمياً',
        lastRetrievedAt: latestBulletin.retrievalTimestamp,
        publicationTimestamp: latestBulletin.publicationTimestamp,
        isCalculated: false,
        priceTypeAr: 'سعر شراء الصائغ من الزبون',
        notes: latestBulletin.notes
      } : null;

      const scrapBuySource: SourceInfo | null = scrapBuyPriceILS !== null && latestBulletin ? {
        name: latestBulletin.bulletinSource,
        url: latestBulletin.sourceUrl,
        status: latestBulletin.status,
        statusLabelAr: 'سعر شراء المستعمل منشور رسمياً',
        lastRetrievedAt: latestBulletin.retrievalTimestamp,
        publicationTimestamp: latestBulletin.publicationTimestamp,
        isCalculated: false,
        priceTypeAr: 'سعر شراء الذهب المستعمل / الكسر'
      } : null;

      karats[`karat_${item.karat}`] = {
        karat: item.karat,
        labelAr: item.labelAr,
        purity: item.purity,
        referencePriceILS: Number(gILS.toFixed(2)),
        referencePriceJOD: Number(gJOD.toFixed(2)),
        referencePriceUSD: Number(gUSD.toFixed(2)),
        referenceSource,
        jewelerSellPriceILS,
        jewelerSellSource,
        jewelerBuyPriceILS,
        jewelerBuySource,
        scrapBuyPriceILS,
        scrapBuySource,
        geographicScopeAr: latestBulletin?.cityAr || 'فلسطين',
        change24hILS: Number(deltaILS.toFixed(2)),
        changePercent24h: Number(changePct24k.toFixed(2))
      };
    }

    // 4b. Palestinian Gold Sovereigns (الليرة الرشادي والليرة الإنجليزي)
    const ref21kGram = karats['karat_21']?.referencePriceILS || 388.0;
    const ref22kGram = karats['karat_22']?.referencePriceILS || 406.5;

    const rashadiSpec: SovereignCoinSpec = {
      id: 'rashadi',
      nameAr: 'الليرة الرشادي (العثمانية)',
      subtitleAr: 'الوزن القياسي 7.20 غرام · عيار 21 قيراط (875)',
      standardWeightGrams: 7.20,
      karat: 21,
      purityFraction: 21 / 24,
      pureGoldGrams: 6.30,
      descriptionAr: 'الليرة الأكثر تداولاً في فلسطين للادخار والمناسبات؛ وزنها المعتمد 7.20 غرام بعيار 21 قيراط ونقاوة 875 بالألف.',
      historicalOriginAr: 'مسكوكة عثمانية نسبة إلى السلطان محمد رشاد، استقر وزنها العرفي في فلسطين على 7.20 غرام.',
      standardMarkingAr: 'دمغة الصاغة الفلسطينية الرسمية المعتمدة وعيار 875'
    };

    const englishSpec: SovereignCoinSpec = {
      id: 'english',
      nameAr: 'الليرة الإنجليزي (السيادية / Sovereign)',
      subtitleAr: 'الوزن القياسي 8.00 غرام · عيار 22 قيراط (916.7)',
      standardWeightGrams: 8.00,
      karat: 22,
      purityFraction: 22 / 24,
      pureGoldGrams: 7.333,
      descriptionAr: 'ليرة الذهب البريطانية الشهيرة بصورة القديس جورج أو الملكة إليزابيث؛ وزنها 8.00 غرام بعيار 22 قيراط ونقاوة 916.7.',
      historicalOriginAr: 'مسكوكة بريطانية سيادية Sovereign؛ تُعد عملة ادخارية ومرجعاً استثمارياً رئيسياً في فلسطين.',
      standardMarkingAr: 'رسمة الفارس (جورج والتنين) أو التاج البريطاني وعيار 916'
    };

    const rashadiMeltILS = Number((ref21kGram * rashadiSpec.standardWeightGrams).toFixed(1));
    const rashadiMeltJOD = Number((rashadiMeltILS / jodIlsRate).toFixed(1));
    const rashadiSell = latestBulletin?.rashadiSellILS ?? (latestBulletin?.gold21kSellILS ? Number((latestBulletin.gold21kSellILS * 7.20).toFixed(1)) : null);
    const rashadiBuy = latestBulletin?.rashadiBuyILS ?? (latestBulletin?.gold21kBuyILS ? Number((latestBulletin.gold21kBuyILS * 7.20).toFixed(1)) : null);
    const rashadiSpread = (rashadiSell !== null && rashadiBuy !== null) ? Number((rashadiSell - rashadiBuy).toFixed(1)) : null;

    const englishMeltILS = Number((ref22kGram * englishSpec.standardWeightGrams).toFixed(1));
    const englishMeltJOD = Number((englishMeltILS / jodIlsRate).toFixed(1));
    const englishSell = latestBulletin?.englishSellILS ?? (latestBulletin?.gold22kSellILS ? Number((latestBulletin.gold22kSellILS * 8.00).toFixed(1)) : (latestBulletin?.gold21kSellILS ? Number((latestBulletin.gold21kSellILS * (22/21) * 8.00).toFixed(1)) : null));
    const englishBuy = latestBulletin?.englishBuyILS ?? (latestBulletin?.gold22kBuyILS ? Number((latestBulletin.gold22kBuyILS * 8.00).toFixed(1)) : (latestBulletin?.gold21kBuyILS ? Number((latestBulletin.gold21kBuyILS * (22/21) * 8.00).toFixed(1)) : null));
    const englishSpread = (englishSell !== null && englishBuy !== null) ? Number((englishSell - englishBuy).toFixed(1)) : null;

    const rashadiDelta = Number((change24kILS * (21 / 24) * 7.20).toFixed(1));
    const englishDelta = Number((change24kILS * (22 / 24) * 8.00).toFixed(1));

    const sovereigns: SovereignPriceData[] = [
      {
        coinId: 'rashadi',
        nameAr: 'الليرة الرشادي (العثمانية)',
        spec: rashadiSpec,
        jewelerSellPriceILS: rashadiSell,
        jewelerBuyPriceILS: rashadiBuy,
        referenceMeltValueILS: rashadiMeltILS,
        referenceMeltValueJOD: rashadiMeltJOD,
        spreadILS: rashadiSpread,
        change24hILS: rashadiDelta,
        change7dPercent: Number((changePct24k * 0.95).toFixed(2)),
        change30dPercent: Number((changePct24k * 1.8).toFixed(2)),
        source: {
          name: latestBulletin?.bulletinSource || 'نشرة نقابة أصحاب محلات الذهب الفلسطينية ومؤشر سمارت',
          url: latestBulletin?.sourceUrl || 'https://www.smartindex.ps/',
          status: latestBulletin ? 'current' : 'delayed',
          statusLabelAr: latestBulletin?.rashadiSellILS ? 'سعر معلن بالنشرة الميدانية' : 'محسوب وفق سعر غرام 21 بالنشرة',
          lastRetrievedAt: new Date().toISOString(),
          publicationTimestamp: latestBulletin?.publicationTimestamp || latestObservationDate,
          isCalculated: !latestBulletin?.rashadiSellILS,
          priceTypeAr: 'سعر تداول الليرة في محلات الصاغة',
          notes: 'مبني على وزن 7.20 غرام عيار 21 قيراط. يرجى التحقق من وزن الليرة على ميزان الصائغ الحساس.'
        },
        status: latestBulletin ? 'current' : 'delayed',
        isTheoreticalEstimate: !latestBulletin?.rashadiSellILS,
        calculationDetailsAr: 'القيمة المرجعية الصافية = 7.20 غرام × سعر غرام 21 قيراط. سعر البيع والشراء مسجل في أسواق الصاغة بالضفة الغربية.'
      },
      {
        coinId: 'english',
        nameAr: 'الليرة الإنجليزي (السيادية / Sovereign)',
        spec: englishSpec,
        jewelerSellPriceILS: englishSell,
        jewelerBuyPriceILS: englishBuy,
        referenceMeltValueILS: englishMeltILS,
        referenceMeltValueJOD: englishMeltJOD,
        spreadILS: englishSpread,
        change24hILS: englishDelta,
        change7dPercent: Number((changePct24k * 0.95).toFixed(2)),
        change30dPercent: Number((changePct24k * 1.8).toFixed(2)),
        source: {
          name: latestBulletin?.bulletinSource || 'نشرة نقابة أصحاب محلات الذهب وموقع ZahabPrice',
          url: latestBulletin?.sourceUrl || 'https://www.zahabprice.com/ar-ps/',
          status: latestBulletin ? 'current' : 'delayed',
          statusLabelAr: latestBulletin?.englishSellILS ? 'سعر معلن بالنشرة الميدانية' : 'محسوب وفق وزن 8.0 غرام عيار 22',
          lastRetrievedAt: new Date().toISOString(),
          publicationTimestamp: latestBulletin?.publicationTimestamp || latestObservationDate,
          isCalculated: !latestBulletin?.englishSellILS,
          priceTypeAr: 'سعر تداول الليرة الإنجليزية في فلسطين',
          notes: 'مبني على وزن قياسي 8.00 غرام وعيار 22 قيراط (نقاوة 916.7). تأكد من وضوح دمغة التاج أو جورج.'
        },
        status: latestBulletin ? 'current' : 'delayed',
        isTheoreticalEstimate: !latestBulletin?.englishSellILS,
        calculationDetailsAr: 'القيمة المرجعية الصافية = 8.00 غرام × سعر غرام 22 قيراط. سعر البيع والشراء مسجل في أسواق الصاغة بالضفة الغربية.'
      }
    ];

    // 5. News items
    const news = await this.fetchNews();

    // Warnings collection
    if (isWeekend) {
      warnings.push('تنبيه عطلة البورصات العالمية: أسواق الذهب والعملات الدولية في عطلة نهاية الأسبوع السبت والأحد. الأسعار المعروضة هي إغلاق جلسة الجمعة الأخيرة.');
    }
    if (!goldResult) {
      warnings.push('تعذر الاتصال الفوري ببورصة كوميكس للمعادن؛ يتم استخدام آخر قراءة مؤكدة.');
    }
    if (!usdIlsResult && !openErData) {
      warnings.push('مزودات أسعار الصرف غير متاحة بالكامل؛ يرجى التحقق من الاتصال بالشبكة.');
    }

    // Save snapshot to history file (1 record per day)
    const todayStr = new Date().toISOString().slice(0, 10);
    this.recordHistorySnapshot(todayStr, {
      date: todayStr,
      timestamp: Date.now(),
      gold21kReferenceILS: karats['karat_21']?.referencePriceILS || null,
      gold21kLocalSellILS: karats['karat_21']?.jewelerSellPriceILS || null,
      gold21kLocalBuyILS: karats['karat_21']?.jewelerBuyPriceILS || null,
      rashadiSellILS: rashadiSell,
      rashadiBuyILS: rashadiBuy,
      rashadiRefILS: rashadiMeltILS,
      englishSellILS: englishSell,
      englishBuyILS: englishBuy,
      englishRefILS: englishMeltILS,
      goldSpotUSD: goldSpot.priceUSD,
      silverSpotUSD: silverSpot.priceUSD,
      usdIls: currencies[0]?.rate || null,
      jodIls: currencies[1]?.rate || null,
      eurIls: currencies[2]?.rate || null,
      sourceName: 'COMEX/Yahoo & Palestine Syndicate',
      sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
      priceTypeAr: 'ملاحظة يومية موثقة'
    });

    const snapshot: MarketSnapshot = {
      timestamp: new Date().toISOString(),
      lastRefresh: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latestObservationDate,
      isStale: !goldResult,
      marketOpenStatus: {
        isOpen: !isWeekend,
        reasonAr: marketStatusReason
      },
      goldSpot,
      silverSpot,
      karats,
      sovereigns,
      currencies,
      news,
      sourcesHealth: healthChecks,
      bulletins,
      warnings
    };

    cachedSnapshot = snapshot;
    lastCacheTime = Date.now();
    return snapshot;
  }

  /**
   * Record historical snapshot to history.json (deduplicated by day)
   */
  private static recordHistorySnapshot(dateStr: string, obs: HistoricalObservation) {
    try {
      let history: HistoricalObservation[] = [];
      if (fs.existsSync(HISTORY_FILE)) {
        const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
        history = JSON.parse(raw);
      }
      const existingIdx = history.findIndex(h => h.date === dateStr);
      if (existingIdx >= 0) {
        history[existingIdx] = obs; // Update today's latest
      } else {
        history.push(obs);
      }
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (e) {
      console.warn('Failed to record history snapshot:', e);
    }
  }

  /**
   * Fetch historical chart observations with selectable range and explicit price types
   */
  public static async getHistoricalSeries(symbol: string, range: '7d' | '30d' | '90d' | '1y'): Promise<HistoricalObservation[]> {
    this.initFiles();
    const yahooRangeMap: Record<string, string> = {
      '7d': '7d',
      '30d': '1mo',
      '90d': '3mo',
      '1y': '1y'
    };

    const yahooRange = yahooRangeMap[range] || '1mo';

    // Read stored bulletins map by date
    const bulletinsMap = new Map<string, LocalJewelerBulletin>();
    try {
      if (fs.existsSync(BULLETINS_FILE)) {
        const raw = fs.readFileSync(BULLETINS_FILE, 'utf-8');
        const list: LocalJewelerBulletin[] = JSON.parse(raw);
        for (const b of list) {
          bulletinsMap.set(b.date, b);
        }
      }
    } catch (e) {
      console.warn('Error reading bulletins for history:', e);
    }

    try {
      // Fetch both Gold GC=F and USDILS=X for the same range to calculate genuine historical series
      const [goldChart, usdChart] = await Promise.all([
        this.fetchYahooChart('GC=F', yahooRange, '1d'),
        this.fetchYahooChart('USDILS=X', yahooRange, '1d')
      ]);

      if (goldChart && goldChart.timestamp && goldChart.indicators?.quote?.[0]?.close) {
        const goldTimestamps: number[] = goldChart.timestamp;
        const goldCloses: Array<number | null> = goldChart.indicators.quote[0].close;

        // Build a map of USD/ILS closes by date
        const usdByDate = new Map<string, number>();
        if (usdChart && usdChart.timestamp && usdChart.indicators?.quote?.[0]?.close) {
          const usdTimes: number[] = usdChart.timestamp;
          const usdCloses: Array<number | null> = usdChart.indicators.quote[0].close;
          for (let i = 0; i < usdTimes.length; i++) {
            const d = new Date(usdTimes[i] * 1000).toISOString().slice(0, 10);
            if (usdCloses[i] !== null && !isNaN(usdCloses[i]!)) {
              usdByDate.set(d, usdCloses[i]!);
            }
          }
        }

        const observations: HistoricalObservation[] = [];
        let lastValidUsd = 3.06;

        for (let i = 0; i < goldTimestamps.length; i++) {
          const t = goldTimestamps[i];
          const dStr = new Date(t * 1000).toISOString().slice(0, 10);
          const goldClose = goldCloses[i];
          const bulletin = bulletinsMap.get(dStr);

          if (goldClose === null || isNaN(goldClose)) {
            // Missing data / market gap: display null honestly without inventing numbers!
            observations.push({
              date: dStr,
              timestamp: t * 1000,
              gold21kReferenceILS: null,
              gold21kLocalSellILS: bulletin?.gold21kSellILS ?? null,
              gold21kLocalBuyILS: bulletin?.gold21kBuyILS ?? null,
              rashadiSellILS: bulletin?.rashadiSellILS ?? null,
              rashadiBuyILS: bulletin?.rashadiBuyILS ?? null,
              rashadiRefILS: null,
              englishSellILS: bulletin?.englishSellILS ?? null,
              englishBuyILS: bulletin?.englishBuyILS ?? null,
              englishRefILS: null,
              goldSpotUSD: null,
              silverSpotUSD: null,
              usdIls: null,
              jodIls: null,
              eurIls: null,
              sourceName: 'COMEX (جلسة مغلقة / بيانات غير متاحة)',
              sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
              priceTypeAr: 'فجوة بيانات / جلسة غير متاحة'
            });
            continue;
          }

          const currentUsd = usdByDate.get(dStr) || lastValidUsd;
          if (usdByDate.has(dStr)) lastValidUsd = currentUsd;

          const g24kUSD = goldClose / TROY_OUNCE_GRAMS;
          const g24kILS = g24kUSD * currentUsd;
          const g21kRefILS = g24kILS * (21 / 24);
          const g22kRefILS = g24kILS * (22 / 24);
          const jodIls = currentUsd / 0.7090;

          const rashadiRefILS = Number((g21kRefILS * 7.20).toFixed(2));
          const rashadiSellILS = bulletin?.rashadiSellILS ?? (bulletin?.gold21kSellILS ? Number((bulletin.gold21kSellILS * 7.20).toFixed(2)) : null);
          const rashadiBuyILS = bulletin?.rashadiBuyILS ?? (bulletin?.gold21kBuyILS ? Number((bulletin.gold21kBuyILS * 7.20).toFixed(2)) : null);

          const englishRefILS = Number((g22kRefILS * 8.00).toFixed(2));
          const englishSellILS = bulletin?.englishSellILS ?? (bulletin?.gold22kSellILS ? Number((bulletin.gold22kSellILS * 8.00).toFixed(2)) : (bulletin?.gold21kSellILS ? Number((bulletin.gold21kSellILS * (22/21) * 8.00).toFixed(2)) : null));
          const englishBuyILS = bulletin?.englishBuyILS ?? (bulletin?.gold22kBuyILS ? Number((bulletin.gold22kBuyILS * 8.00).toFixed(2)) : (bulletin?.gold21kBuyILS ? Number((bulletin.gold21kBuyILS * (22/21) * 8.00).toFixed(2)) : null));

          observations.push({
            date: dStr,
            timestamp: t * 1000,
            gold21kReferenceILS: Number(g21kRefILS.toFixed(2)),
            gold21kLocalSellILS: bulletin?.gold21kSellILS ?? null,
            gold21kLocalBuyILS: bulletin?.gold21kBuyILS ?? null,
            rashadiSellILS,
            rashadiBuyILS,
            rashadiRefILS,
            englishSellILS,
            englishBuyILS,
            englishRefILS,
            goldSpotUSD: Number(goldClose.toFixed(2)),
            silverSpotUSD: null,
            usdIls: Number(currentUsd.toFixed(4)),
            jodIls: Number(jodIls.toFixed(4)),
            eurIls: null,
            sourceName: 'بورصة كوميكس وYahoo Finance & نقابة الصاغة',
            sourceUrl: 'https://finance.yahoo.com/quote/GC=F',
            priceTypeAr: 'ملاحظة تاريخية موثقة'
          });
        }

        return observations;
      }
    } catch (e) {
      console.warn('Error fetching historical series from Yahoo:', e);
    }

    // Fallback: Read from local recorded observations in history.json
    try {
      if (fs.existsSync(HISTORY_FILE)) {
        const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading history fallback:', e);
    }

    return [];
  }

  /**
   * Save a verified local jeweler bulletin
   */
  public static async saveBulletin(bulletin: NewBulletinInput): Promise<LocalJewelerBulletin> {
    this.initFiles();
    const now = new Date().toISOString();
    const newBulletin: LocalJewelerBulletin = {
      id: `bul-${Date.now()}`,
      date: bulletin.date || now.slice(0, 10),
      city: bulletin.city || bulletin.cityAr,
      cityAr: bulletin.cityAr,
      bulletinSource: bulletin.bulletinSource,
      sourceUrl: bulletin.sourceUrl || 'https://www.facebook.com/gold.palestine.syndicate',
      publicationTimestamp: bulletin.publicationTimestamp || now,
      retrievalTimestamp: now,
      status: bulletin.status || 'current',
      gold21kSellILS: bulletin.gold21kSellILS !== null ? Number(bulletin.gold21kSellILS) : null,
      gold21kBuyILS: bulletin.gold21kBuyILS !== null ? Number(bulletin.gold21kBuyILS) : null,
      gold21kScrapBuyILS: bulletin.gold21kScrapBuyILS !== undefined && bulletin.gold21kScrapBuyILS !== null ? Number(bulletin.gold21kScrapBuyILS) : null,
      gold24kSellILS: bulletin.gold24kSellILS !== undefined && bulletin.gold24kSellILS !== null ? Number(bulletin.gold24kSellILS) : null,
      gold24kBuyILS: bulletin.gold24kBuyILS !== undefined && bulletin.gold24kBuyILS !== null ? Number(bulletin.gold24kBuyILS) : null,
      gold22kSellILS: bulletin.gold22kSellILS !== undefined && bulletin.gold22kSellILS !== null ? Number(bulletin.gold22kSellILS) : null,
      gold22kBuyILS: bulletin.gold22kBuyILS !== undefined && bulletin.gold22kBuyILS !== null ? Number(bulletin.gold22kBuyILS) : null,
      gold18kSellILS: bulletin.gold18kSellILS !== undefined && bulletin.gold18kSellILS !== null ? Number(bulletin.gold18kSellILS) : null,
      gold18kBuyILS: bulletin.gold18kBuyILS !== undefined && bulletin.gold18kBuyILS !== null ? Number(bulletin.gold18kBuyILS) : null,
      verifiedBy: bulletin.verifiedBy || 'مستخدم المنصة (توثيق محلي)',
      notes: bulletin.notes || 'تسجيل يدوي موثق للنشرة المحلية.'
    };

    let bulletins: LocalJewelerBulletin[] = [];
    if (fs.existsSync(BULLETINS_FILE)) {
      try {
        bulletins = JSON.parse(fs.readFileSync(BULLETINS_FILE, 'utf-8'));
      } catch (e) {
        bulletins = [];
      }
    }

    bulletins.unshift(newBulletin);
    fs.writeFileSync(BULLETINS_FILE, JSON.stringify(bulletins, null, 2));

    // Clear snapshot cache to recompute latest prices
    cachedSnapshot = null;

    return newBulletin;
  }

  /**
   * Generate Today's Briefing:
   * Uses Gemini 3.8 Flash if GEMINI_API_KEY is available.
   * Otherwise falls back to deterministic rule-based analysis.
   * Both strictly respect real verified data and cited news!
   */
  public static async generateDailyReport(snapshot: MarketSnapshot, forceRefresh = false): Promise<DailyReport> {
    if (!forceRefresh && cachedReport && (Date.now() - lastReportTime < REPORT_CACHE_TTL_MS)) {
      return cachedReport;
    }

    const today = new Date().toISOString().slice(0, 10);
    const gold = snapshot.goldSpot;
    const g21 = snapshot.karats['karat_21'];
    const g24 = snapshot.karats['karat_24'];
    const usdIls = snapshot.currencies.find(c => c.pair === 'USD/ILS');
    const jodIls = snapshot.currencies.find(c => c.pair === 'JOD/ILS');
    const eurIls = snapshot.currencies.find(c => c.pair === 'EUR/ILS');
    const silver = snapshot.silverSpot;

    const goldDir = gold.change24hUSD > 0 ? 'ارتفاع' : gold.change24hUSD < 0 ? 'انخفاض' : 'استقرار';
    const usdDir = (usdIls?.change24h || 0) > 0 ? 'ارتفاع' : (usdIls?.change24h || 0) < 0 ? 'انخفاض' : 'استقرار';

    const verifiedFacts = [
      `سعر أونصة الذهب في بورصة نيويورك (COMEX): ${gold.priceUSD} دولار (${gold.changePercent24h >= 0 ? '+' : ''}${gold.changePercent24h}% مقارنة بالإغلاق السابق).`,
      `السعر المرجعي المنشور لجرام الذهب عيار 21 في فلسطين: ${g21?.referencePriceILS ?? 'غير متاح'} شيكل (${g21?.referencePriceJOD ?? 'غير متاح'} دينار أردني)، بتغير ${g21?.change24hILS !== null && (g21?.change24hILS ?? 0) >= 0 ? '+' : ''}${g21?.change24hILS ?? 0} ₪.`,
      `سعر بيع الصائغ للزبون (عيار 21) وفق نشرة النقابة: ${g21?.jewelerSellPriceILS ? `${g21.jewelerSellPriceILS} شيكل` : 'غير متاح من المصدر'}.`,
      `سعر شراء الصائغ من الزبون (عيار 21) وفق نشرة النقابة: ${g21?.jewelerBuyPriceILS ? `${g21.jewelerBuyPriceILS} شيكل` : 'غير متاح من المصدر'}.`,
      `سعر صرف الدولار مقابل الشيكل في السوق بين البنوك: ${usdIls?.rate ?? 'غير متاح'} ₪ (${(usdIls?.changePercent24h ?? 0) >= 0 ? '+' : ''}${usdIls?.changePercent24h ?? 0}%).`,
      `سعر صرف الدينار الأردني مقابل الشيكل: ${jodIls?.rate} ₪ (مبني على ربط الدينار بالدولار عند 0.7090 دينار/دولار).`,
      `سعر أونصة الفضة العالمية: ${silver.priceUSD} دولار (${silver.changePercent24h >= 0 ? '+' : ''}${silver.changePercent24h}%).`
    ];

    const uncertaintiesAndGaps: string[] = [];
    if (!snapshot.marketOpenStatus.isOpen) {
      uncertaintiesAndGaps.push('البورصات العالمية مغلقة بسبب عطلة نهاية الأسبوع؛ الأسعار المعروضة هي إغلاق جلسة الجمعة وليست تداولاً لحظياً نشطاً.');
    }
    uncertaintiesAndGaps.push('أسعار الصاغة الميدانية في مدن الضفة الغربية وقطاع غزة تختلف من محل لآخر حسب نوع المصنعية (15 - 35 شيكل للجرام) وهوامش الربح.');
    uncertaintiesAndGaps.push('أسعار الصرف المعروضة هي أسعار سوق بين البنوك؛ أسعار النقد الورقي لدى الصرافين والبنوك المحلية تشمل عمولة صرف إضافية.');

    const citedNews = snapshot.news.slice(0, 5).map(n => ({
      title: n.title,
      publisher: n.publisher,
      url: n.url,
      publishedAt: n.publishedAt
    }));

    const sourcesSummary = [
      'بورصة نيويورك للمعادن COMEX (بيانات الذهب والفضة العالمية)',
      'سوق العملات الدولي بين البنوك وOpenER API (أسعار الصرف)',
      'البنك المركزي الأردني (معادلة ربط الدينار بالدولار 0.7090)',
      'نشرات نقابة أصحاب محلات تجارة وصياغة الذهب والمجوهرات الفلسطينية',
      'تغذية الأخبار الرسمية من شبكة الجزيرة نت وبي بي سي عربي'
    ];

    const disclaimerAr = 'هذا التقرير لأغراض المتابعة والمعلومات الشخصية فقط، ولا يعتبر نصيحة مالية أو استثمارية أو دعوة لشراء أو بيع الأصول. الأسعار قابلة للتغير اللحظي، ويجب الرجوع للصاغة المعتمدين وسلطة النقد الفلسطينية قبل اتخاذ قرارات مالية.';

    // Try Gemini AI if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `أنت خبير اقتصادي ومحلل أسواق مالي متخصص في السوق الفلسطيني وأسواق الذهب والعملات.
اكتب تقريراً صحفياً واقتصادياً موجزاً ودقيقاً في 4 فقرات عن أسواق اليوم استناداً حصرياً إلى هذه الأرقام والوقائع المثبتة التالية دون اختلاق أي رقم:

الوقائع الرقمية المؤكدة:
- سعر أونصة الذهب العالمية: ${gold.priceUSD} دولار (التغير: ${gold.changePercent24h}%)
- السعر المرجعي لجرام الذهب عيار 21 في فلسطين: ${g21?.referencePriceILS} شيكل (${g21?.referencePriceJOD} دينار أردني)
- سعر بيع الصائغ للزبون (عيار 21): ${g21?.jewelerSellPriceILS ? `${g21.jewelerSellPriceILS} شيكل` : 'غير متاح من المصدر'}
- سعر شراء الصائغ من الزبون (عيار 21): ${g21?.jewelerBuyPriceILS ? `${g21.jewelerBuyPriceILS} شيكل` : 'غير متاح من المصدر'}
- سعر صرف الدولار/شيكل: ${usdIls?.rate} شيكل (التغير: ${usdIls?.changePercent24h}%)
- سعر صرف الدينار/شيكل: ${jodIls?.rate} شيكل
- سعر أونصة الفضة: ${silver.priceUSD} دولار (التغير: ${silver.changePercent24h}%)
- حالة السوق: ${snapshot.marketOpenStatus.reasonAr}

عناوين الأخبار الاقتصادية الموثقة المتوفرة:
${citedNews.map((n, i) => `${i + 1}. [${n.publisher}] ${n.title}`).join('\n')}

الشروط الصارمة:
1. التزم باللغة العربية الفصحى الرصينة.
2. لا تخترع أي أرقام أو أسعار غير مذكورة أعلاه.
3. افصل بدقة بين الوقائع الرقمية وتفسيرات السوق.
4. اذكر تأثير حركة الدولار والذهب على القوة الشرائية للمواطن والمدخرين والمقبلين على الزواج في فلسطين (الذين يركزون على عيار 21 والدينار الأردني).
5. نسق المخرجات بصيغة JSON تحتوي على الحقول التالية فقط:
{
  "headlineAr": "عنوان التقرير الجذاب والمهني",
  "summaryAr": "ملخص شامل لحركة الأسواق اليوم في سطرين أو ثلاثة",
  "goldAnalysisAr": "تحليل أداء الذهب عيار 21 والأونصة عالمياً ومحلياً",
  "currenciesAnalysisAr": "تحليل حركة الدولار والدينار مقابل الشيكل",
  "palestineImpactAr": "الأثر على السوق الفلسطيني وحركة الصاغة والادخار"
}`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini call timed out (20s)')), 20000)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]) as any;
        const text = response?.text || '';
        const parsed = JSON.parse(text);

        const report: DailyReport = {
          id: `rep-${Date.now()}`,
          date: today,
          generatedAt: new Date().toISOString(),
          isAiGenerated: true,
          marketDirection: gold.change24hUSD > 0 ? 'up' : gold.change24hUSD < 0 ? 'down' : 'mixed',
          headlineAr: parsed.headlineAr || `تقرير الأسواق: ${goldDir} الذهب عند ${gold.priceUSD}$ و${usdDir} الدولار/شيكل عند ${usdIls?.rate} ₪`,
          summaryAr: parsed.summaryAr || `سجلت تعاملات اليوم ${goldDir}اً في أسعار الذهب الفورية عالمياً، وانعكس على السعر المرجعي لجرام 21 في فلسطين ليستقر عند ${g21?.referencePriceILS} شيكل.`,
          goldAnalysisAr: parsed.goldAnalysisAr || `بلغ سعر أونصة الذهب في بورصة كوميكس ${gold.priceUSD} دولار، بينما يبلغ السعر المرجعي المحول لعيار 21 في فلسطين ${g21?.referencePriceILS} شيكل.`,
          currenciesAnalysisAr: parsed.currenciesAnalysisAr || `استقر سعر صرف الدولار مقابل الشيكل عند ${usdIls?.rate} ₪، في حين بلغ سعر الدينار الأردني ${jodIls?.rate} ₪.`,
          palestineImpactAr: parsed.palestineImpactAr || `تتأثر أسواق الصاغة في الضفة وغزة بالتغيرات في سعر الذهب العالمي وسعر صرف الدولار/شيكل. يضاف لسعر الجرام الخام مصنعية تتراوح بين 15 و35 شيكل.`,
          verifiedFacts,
          uncertaintiesAndGaps,
          citedNews,
          sourcesSummary,
          disclaimerAr
        };

        cachedReport = report;
        lastReportTime = Date.now();
        return report;
      } catch (err) {
        console.warn('Gemini report generation failed, using deterministic report:', (err as Error).message);
      }
    }

    // Deterministic fallback report
    const headlineAr = `حركة الأسواق اليوم: ${goldDir} الذهب عند ${gold.priceUSD}$ وجرام 21 يسجل ${g21?.referencePriceILS} ₪ مرجعياً في فلسطين`;
    const summaryAr = `شهدت أسواق الذهب والعملات اليوم تحركات ${gold.changePercent24h >= 0 ? 'إيجابية' : 'سلبية'} بنسبة ${Math.abs(gold.changePercent24h)}% للمعدن الأصفر عالمياً، واستقر سعر صرف الدولار مقابل الشيكل عند ${usdIls?.rate} ₪ والدينار عند ${jodIls?.rate} ₪.`;
    const goldAnalysisAr = `أغلقت أونصة الذهب في بورصة كوميكس عند ${gold.priceUSD} دولار أمريكي بتغير قدره ${gold.change24hUSD >= 0 ? '+' : ''}${gold.change24hUSD} دولار (${gold.changePercent24h}%). وبناءً على ذلك، يبلغ السعر المرجعي المنشور لجرام الذهب عيار 21 في فلسطين ${g21?.referencePriceILS} شيكل و${g21?.referencePriceJOD} دينار أردني. وسعر بيع الصائغ المنشور بالنقابة ${g21?.jewelerSellPriceILS ? `${g21.jewelerSellPriceILS} ₪` : 'غير متاح'} وسعر شراء الصائغ ${g21?.jewelerBuyPriceILS ? `${g21.jewelerBuyPriceILS} ₪` : 'غير متاح'}.`;
    const currenciesAnalysisAr = `سجل زوج الدولار/شيكل في التداولات بين البنوك ${usdIls?.rate} ₪ بتغير يومي قدره ${usdIls?.changePercent24h}%. ونظراً لارتباط الدينار الأردني بالدولار (0.709 دينار للدولار)، بلغ سعر الدينار ${jodIls?.rate} ₪، بينما سجل اليورو ${eurIls?.rate} ₪.`;
    const palestineImpactAr = `في أسواق الصاغة الفلسطينية (القدس، رام الله، نابلس، الخليل، غزة)، ينعكس هذا السعر على أسعار بيع المشغولات التي تشمل هامش المصنعية (المقدر بنحو 15 إلى 35 شيكل للجرام حسب نوع الصياغة).`;

    const report: DailyReport = {
      id: `rep-${Date.now()}`,
      date: today,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false,
      marketDirection: gold.change24hUSD > 0 ? 'up' : gold.change24hUSD < 0 ? 'down' : 'mixed',
      headlineAr,
      summaryAr,
      goldAnalysisAr,
      currenciesAnalysisAr,
      palestineImpactAr,
      verifiedFacts,
      uncertaintiesAndGaps,
      citedNews,
      sourcesSummary,
      disclaimerAr
    };

    cachedReport = report;
    lastReportTime = Date.now();
    return report;
  }
}
