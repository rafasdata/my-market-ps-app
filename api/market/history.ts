import type { IncomingMessage, ServerResponse } from 'http';
import { DataService } from '../../server/dataService.ts';

type Req = IncomingMessage & { query?: Record<string, string> };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => Res;
};

export default async function handler(req: Req, res: Res) {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const symbol = url.searchParams.get('symbol') || req.query?.symbol || 'gold_21k_ils';
    const range = (url.searchParams.get('range') || req.query?.range || '30d') as '7d' | '30d' | '90d' | '1y';
    const history = await DataService.getHistoricalSeries(symbol, range);
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ success: true, symbol, range, data: history });
  } catch (err) {
    console.error('Error in /api/market/history:', err);
    return res.status(500).json({
      success: false,
      error: 'تعذر جلب البيانات التاريخية',
      details: (err as Error).message
    });
  }
}
