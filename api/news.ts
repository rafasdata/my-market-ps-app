import type { IncomingMessage, ServerResponse } from 'http';
import { DataService } from '../server/dataService.ts';

type Req = IncomingMessage;
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => Res;
};

export default async function handler(_req: Req, res: Res) {
  try {
    const news = await DataService.fetchNews();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    console.error('Error in /api/news:', err);
    return res.status(500).json({
      success: false,
      error: 'تعذر جلب الأخبار الاقتصادية',
      details: (err as Error).message
    });
  }
}
