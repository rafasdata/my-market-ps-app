import type { IncomingMessage, ServerResponse } from 'http';
import { DataService } from '../../server/dataService.ts';

type Req = IncomingMessage & { query?: Record<string, string>; body?: any };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => Res;
};

export default async function handler(req: Req, res: Res) {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const force = url.searchParams.get('force') === 'true' || req.query?.force === 'true' || req.body?.force === true;
    const snapshot = req.body?.snapshot || await DataService.getLatestMarket(force);
    const report = await DataService.generateDailyReport(snapshot, force);
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error('Error in /api/market/report:', err);
    return res.status(500).json({
      success: false,
      error: 'تعذر إعداد تقرير السوق اليومي',
      details: (err as Error).message
    });
  }
}
