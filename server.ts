import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { DataService } from './server/dataService.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoints

// 1. Latest verified market snapshot
app.get('/api/market/latest', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const data = await DataService.getLatestMarket(force);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error in /api/market/latest:', err);
    res.status(500).json({
      success: false,
      error: 'تعذر جلب بيانات السوق الحالية في الوقت الراهن',
      details: (err as Error).message
    });
  }
});

// 2. Historical price observations for charts
app.get('/api/market/history', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'gold_21k_ils';
    const range = (req.query.range as '7d' | '30d' | '90d' | '1y') || '30d';
    const history = await DataService.getHistoricalSeries(symbol, range);
    res.json({ success: true, symbol, range, data: history });
  } catch (err) {
    console.error('Error in /api/market/history:', err);
    res.status(500).json({
      success: false,
      error: 'تعذر جلب البيانات التاريخية',
      details: (err as Error).message
    });
  }
});

// 3. Verified Arabic economic news
app.get('/api/news', async (_req, res) => {
  try {
    const news = await DataService.fetchNews();
    res.json({ success: true, data: news });
  } catch (err) {
    console.error('Error in /api/news:', err);
    res.status(500).json({
      success: false,
      error: 'تعذر جلب الأخبار الاقتصادية',
      details: (err as Error).message
    });
  }
});

// 4. Daily market briefing generation
app.post('/api/market/report', async (req, res) => {
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const snapshot = req.body?.snapshot || await DataService.getLatestMarket(force);
    const report = await DataService.generateDailyReport(snapshot, force);
    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error in /api/market/report:', err);
    res.status(500).json({
      success: false,
      error: 'تعذر إعداد تقرير السوق اليومي',
      details: (err as Error).message
    });
  }
});

// 5. Palestinian jeweler bulletins
app.get('/api/bulletins', async (_req, res) => {
  try {
    const snapshot = await DataService.getLatestMarket(false);
    res.json({ success: true, data: snapshot.bulletins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب نشرات الصاغة' });
  }
});

app.post('/api/bulletins', async (req, res) => {
  try {
    const { city, cityAr, bulletinSource, gold21kBuyILS, gold21kSellILS, gold24kSellILS, gold18kSellILS, verifiedBy, notes } = req.body;
    if (!cityAr || !gold21kSellILS || !bulletinSource) {
      return res.status(400).json({ success: false, error: 'يرجى تزويد اسم المدينة ومصدر النشرة وأسعار الذهب' });
    }
    const today = new Date().toISOString().slice(0, 10);
    const created = await DataService.saveBulletin({
      date: today,
      city: city || cityAr,
      cityAr,
      bulletinSource,
      gold21kBuyILS: Number(gold21kBuyILS),
      gold21kSellILS: Number(gold21kSellILS),
      gold24kSellILS: Number(gold24kSellILS || 0),
      gold18kSellILS: Number(gold18kSellILS || 0),
      verifiedBy: verifiedBy || 'مستخدم المنصة (توثيق محلي)',
      notes
    });
    res.json({ success: true, data: created });
  } catch (err) {
    console.error('Error in POST /api/bulletins:', err);
    res.status(500).json({ success: false, error: 'تعذر حفظ النشرة' });
  }
});

// 6. Sources health status
app.get('/api/sources/health', async (_req, res) => {
  try {
    const snapshot = await DataService.getLatestMarket(false);
    res.json({ success: true, data: snapshot.sourcesHealth });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب صحة المصادر' });
  }
});

// Mount Vite or static build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[My Market — Palestine] Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
