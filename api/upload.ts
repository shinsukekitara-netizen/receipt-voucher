import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } },
};

/** URLセーフbase64 → 標準base64 → Buffer */
function base64ToBuffer(b64: string): Buffer {
  const standard = b64.replace(/[-]/g, '+').replace(/[_]/g, '/');
  return Buffer.from(standard, 'base64');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON が設定されていません。' });
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const folderId = '1dmoLRsgNMu0leyYQQRhc-7UoN3DZ_utp';

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const { pdfBase64, pdfName, imageBase64, imageMimeType, imageName } = req.body;

    // PDF をアップロード
    const pdfBuffer = base64ToBuffer(pdfBase64);
    await drive.files.create({
      requestBody: { name: pdfName, parents: [folderId] },
      media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
    });

    // レシート画像をアップロード
    const imgBuffer = base64ToBuffer(imageBase64);
    await drive.files.create({
      requestBody: { name: imageName, parents: [folderId] },
      media: { mimeType: imageMimeType, body: Readable.from(imgBuffer) },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '不明なエラー';
    return res.status(500).json({ error: `アップロードに失敗しました: ${msg}` });
  }
}
