import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const OCR_PROMPT = `あなたはOCRと伝票作成の専門家です。
添付された領収証・レシートの画像を解析し、以下のJSON形式で情報を返してください。

{
  "payee": "支払先名称（画像から読み取り。不明な場合は空文字）",
  "amount": 金額（数値のみ。税込合計金額。読み取れない場合は0）,
  "amountText": "金額のテキスト表記（例: ¥1,500）",
  "receiptDate": "領収証の日付（YYYY-MM-DD形式。不明な場合は空文字）",
  "items": "主な品目・内訳（簡潔に）"
}

JSONのみを返し、説明文は不要です。`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'サーバーのANTHROPIC_API_KEYが設定されていません。' });
  }

  try {
    const { imageBase64, mimeType } = req.body as { imageBase64: string; mimeType: string };
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'imageBase64 と mimeType は必須です。' });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    const parsed = JSON.parse(jsonStr) as {
      payee?: string;
      amount?: number;
      amountText?: string;
      receiptDate?: string;
      items?: string;
    };

    return res.status(200).json({
      payee: parsed.payee ?? '',
      amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
      amountText: parsed.amountText ?? (parsed.amount ? `¥${parsed.amount.toLocaleString()}` : '¥0'),
      receiptDate: parsed.receiptDate ?? '',
      items: parsed.items ?? '',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー';
    console.error('OCR Error:', message);
    return res.status(500).json({ error: `OCR処理に失敗しました: ${message}` });
  }
}
