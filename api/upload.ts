import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  if (!scriptUrl) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL が設定されていません。' });
  }

  try {
    // 1回目：リダイレクトを手動制御（POSTのままにするため）
    const resp = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'manual',
    });

    // デバッグ：リダイレクト先URLを返す
    const location = resp.headers.get('location') ?? 'locationヘッダーなし';
    return res.status(200).json({
      error: `status=${resp.status} location=${location.substring(0, 200)}`
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '不明なエラー';
    return res.status(500).json({ error: `アップロードに失敗しました: ${msg}` });
  }
}
