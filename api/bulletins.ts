import type { IncomingMessage, ServerResponse } from 'http';
import { DataService } from '../server/dataService.ts';

type Req = IncomingMessage & { body?: any };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => Res;
};

export default async function handler(req: Req, res: Res) {
  if (req.method === 'POST') {
    try {
      const { city, cityAr, bulletinSource, gold21kBuyILS, gold21kSellILS, gold24kSellILS, gold18kSellILS, verifiedBy, notes } = req.body || {};
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
      return res.status(200).json({ success: true, data: created });
    } catch (err) {
      console.error('Error in POST /api/bulletins:', err);
      return res.status(500).json({ success: false, error: 'تعذر حفظ النشرة' });
    }
  }

  try {
    const snapshot = await DataService.getLatestMarket(false);
    return res.status(200).json({ success: true, data: snapshot.bulletins });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'تعذر جلب نشرات الصاغة' });
  }
}
