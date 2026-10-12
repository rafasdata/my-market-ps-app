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
    const force = url.searchParams.get('force') === 'true' || req.query?.force === 'true';
    const data = await DataService.getLatestMarket(force);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error in /api/market/latest:', err);
    return res.status(500).json({
      success: false,
      error: 'تعذر جلب بيانات السوق الحالية في الوقت الراهن',
      details: (err as Error).message
    });
  }
}
