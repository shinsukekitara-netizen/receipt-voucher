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
    const resp = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
    });
    const text = await resp.text();
    try {
      const result = JSON.parse(text);
      return res.status(200).json(result);
    } catch {
      // JSON以外（HTMLエラーページ等）が返された場合は内容を表示
      return res.status(500).json({ error: 'Apps Scriptエラー: ' + text.substring(0, 300) });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '不明なエラー';
    return res.status(500).json({ error: `アップロードに失敗しました: ${msg}` });
  }
}
