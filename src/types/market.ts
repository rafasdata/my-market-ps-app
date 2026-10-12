export type DataStatus = 'current' | 'delayed' | 'historical' | 'unavailable' | 'unverified';

export interface SourceInfo {
  name: string;
  url: string;
  status: DataStatus;
  statusLabelAr: string;
  lastRetrievedAt: string;
  publicationTimestamp?: string;
  isCalculated: boolean;
  priceTypeAr: string;
  notes?: string;
}

export interface GoldKaratData {
  karat: 24 | 22 | 21 | 18 | 14;
  labelAr: string;
  purity: number; // e.g. 0.875 for 21K
  
  // 1. السعر المرجعي المنشور (محسوب من الأونصة وسعر الصرف اللحظي)
  referencePriceILS: number | null;
  referencePriceJOD: number | null;
  referencePriceUSD: number | null;
  referenceSource: SourceInfo;
  
  // 2. سعر بيع الصائغ للزبون (من النشرة المحلية الموثقة في فلسطين)
  jewelerSellPriceILS: number | null;
  jewelerSellSource: SourceInfo | null;
  
  // 3. سعر شراء الصائغ من الزبون (من النشرة المحلية الموثقة في فلسطين)
  jewelerBuyPriceILS: number | null;
  jewelerBuySource: SourceInfo | null;
  
  // 4. سعر شراء الذهب المستعمل / الكسر (فقط إذا أتاح المصدر ذلك صراحة)
  scrapBuyPriceILS: number | null;
  scrapBuySource: SourceInfo | null;
  
  geographicScopeAr: string;
  change24hILS: number | null;
  changePercent24h: number | null;
}

export interface MetalPrice {
  symbol: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  priceUSD: number;
  change24hUSD: number;
  changePercent24h: number;
  prevCloseUSD: number;
  highUSD: number;
  lowUSD: number;
  source: SourceInfo;
}

export interface CurrencyRate {
  pair: string;            // e.g. "USD/ILS"
  base: string;            // "USD"
  target: string;          // "ILS"
  nameAr: string;          // "الدولار الأمريكي مقابل الشيكل الإسرائيلي"
  directionAr: string;     // "1 دولار أمريكي = X شيكل إسرائيلي"
  rate: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  rateType: 'market' | 'reference' | 'bank_indicative' | 'fixed_peg';
  rateTypeLabelAr: string; // "سعر تداول الأسواق بين البنوك"
  customerAdvisoryAr: string;
  source: SourceInfo;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publisher: string;
  publishedAt: string;
  category: string;
  relatedAsset?: string;
}

export interface HistoricalObservation {
  date: string; // YYYY-MM-DD
  timestamp: number;
  
  // Explicitly separate series (never mix or substitute!)
  gold21kReferenceILS: number | null;  // السعر المرجعي المنشور (COMEX Spot converted to ILS)
  gold21kLocalSellILS: number | null;   // سعر بيع الصائغ المحلي المنشور في فلسطين
  gold21kLocalBuyILS: number | null;    // سعر شراء الصائغ المحلي المنشور في فلسطين
  
  // الليرات الذهبية (سلسلة تاريخية مستقلة)
  rashadiSellILS?: number | null;       // سعر بيع ليرة رشادي للزبون
  rashadiBuyILS?: number | null;        // سعر شراء الصائغ لليرة رشادي من الزبون
  rashadiRefILS?: number | null;        // السعر المرجعي الصافي للرشادي
  englishSellILS?: number | null;       // سعر بيع ليرة إنجليزي للزبون
  englishBuyILS?: number | null;        // سعر شراء الصائغ لليرة إنجليزي من الزبون
  englishRefILS?: number | null;        // السعر المرجعي الصافي للإنجليزي
  
  goldSpotUSD: number | null;           // أونصة الذهب العالمية (COMEX Spot USD)
  silverSpotUSD: number | null;         // أونصة الفضة العالمية (COMEX Spot USD)
  
  usdIls: number | null;                // USD -> ILS
  jodIls: number | null;                // JOD -> ILS
  eurIls: number | null;
  
  sourceName: string;
  sourceUrl: string;
  priceTypeAr: string;
}

export type SovereignType = 'rashadi' | 'english' | 'custom';

export interface SovereignCoinSpec {
  id: SovereignType;
  nameAr: string;
  subtitleAr: string;
  standardWeightGrams: number;
  karat: number;
  purityFraction: number; // 0.875 or 0.9167
  pureGoldGrams: number;
  descriptionAr: string;
  historicalOriginAr: string;
  standardMarkingAr: string;
}

export interface SovereignPriceData {
  coinId: SovereignType;
  nameAr: string;
  spec: SovereignCoinSpec;
  jewelerSellPriceILS: number | null; // سعر بيع الصائغ للزبون (شراء الزبون)
  jewelerBuyPriceILS: number | null;  // سعر شراء الصائغ من الزبون (بيع الزبون)
  referenceMeltValueILS: number;      // القيمة المرجعية الصافية لكمية الذهب فقط
  referenceMeltValueJOD: number;      // القيمة بالدينار الأردني
  spreadILS: number | null;
  change24hILS: number | null;
  change7dPercent: number | null;
  change30dPercent: number | null;
  source: SourceInfo;
  status: DataStatus;
  isTheoreticalEstimate: boolean;     // هل هو سعر سوق فعلي منشور أم تقدير نظري
  calculationDetailsAr?: string;
  notes?: string;
}

export interface SourceHealthCheck {
  id: string;
  name: string;
  category: 'metals' | 'fx' | 'news' | 'local_pma' | 'syndicate';
  categoryAr: string;
  endpointUrl: string;
  homeUrl: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
  lastSuccessfulFetch: string;
  latestObservationDate: string;
  limitationsAr: string;
  licenseAr: string;
  dataTypeAr: string;
}

export interface LocalJewelerBulletin {
  id: string;
  date: string; // YYYY-MM-DD
  city: string;
  cityAr: string;
  bulletinSource: string; // "نشرة نقابة أصحاب محلات تجارة وصياغة الذهب والمجوهرات الفلسطينية"
  sourceUrl: string;
  publicationTimestamp: string;
  retrievalTimestamp: string;
  status: DataStatus;
  
  // 21K
  gold21kSellILS: number | null; // سعر بيع الصائغ للزبون
  gold21kBuyILS: number | null;  // سعر شراء الصائغ من الزبون
  gold21kScrapBuyILS: number | null; // سعر شراء الذهب المستعمل (إن وفره المصدر صراحة)
  
  // 24K
  gold24kSellILS: number | null;
  gold24kBuyILS: number | null;
  
  // 22K
  gold22kSellILS: number | null;
  gold22kBuyILS: number | null;
  
  // 18K
  gold18kSellILS: number | null;
  gold18kBuyILS: number | null;
  
  // الليرات في النشرة إن توفرت
  rashadiSellILS?: number | null;
  rashadiBuyILS?: number | null;
  englishSellILS?: number | null;
  englishBuyILS?: number | null;
  
  verifiedBy: string;
  notes?: string;
}

export type NewBulletinInput = {
  date?: string;
  city?: string;
  cityAr: string;
  bulletinSource: string;
  sourceUrl?: string;
  publicationTimestamp?: string;
  status?: DataStatus;
  gold21kSellILS: number | null;
  gold21kBuyILS: number | null;
  gold21kScrapBuyILS?: number | null;
  gold24kSellILS?: number | null;
  gold24kBuyILS?: number | null;
  gold22kSellILS?: number | null;
  gold22kBuyILS?: number | null;
  gold18kSellILS?: number | null;
  gold18kBuyILS?: number | null;
  rashadiSellILS?: number | null;
  rashadiBuyILS?: number | null;
  englishSellILS?: number | null;
  englishBuyILS?: number | null;
  verifiedBy?: string;
  notes?: string;
};

export interface DailyReport {
  id: string;
  date: string;
  generatedAt: string;
  isAiGenerated: boolean;
  marketDirection: 'up' | 'down' | 'mixed';
  headlineAr: string;
  summaryAr: string;
  goldAnalysisAr: string;
  currenciesAnalysisAr: string;
  palestineImpactAr: string;
  verifiedFacts: string[];
  uncertaintiesAndGaps: string[];
  citedNews: {
    title: string;
    publisher: string;
    url: string;
    publishedAt: string;
  }[];
  sourcesSummary: string[];
  disclaimerAr: string;
}

export interface MarketSnapshot {
  timestamp: string;
  lastRefresh: string;
  latestObservationDate: string;
  isStale: boolean;
  marketOpenStatus: {
    isOpen: boolean;
    reasonAr: string;
  };
  goldSpot: MetalPrice;
  silverSpot: MetalPrice;
  karats: Record<string, GoldKaratData>;
  sovereigns: SovereignPriceData[];
  currencies: CurrencyRate[];
  news: NewsItem[];
  sourcesHealth: SourceHealthCheck[];
  bulletins: LocalJewelerBulletin[];
  warnings: string[];
}
