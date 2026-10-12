import type { IncomingMessage, ServerResponse } from 'http';
import { DataService } from '../../server/dataService.ts';

type Req = IncomingMessage;
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => Res;
};

export default async function handler(_req: Req, res: Res) {
  try {
    const snapshot = await DataService.getLatestMarket(false);
    return res.status(200).json({ success: true, data: snapshot.sourcesHealth });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'تعذر جلب صحة المصادر' });
  }
}
