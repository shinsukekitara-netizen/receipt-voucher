import type { OcrResult } from '../types/voucher';

export async function runOcr(
  imageBase64: string,
  mimeType: string
): Promise<OcrResult> {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'サーバーエラーが発生しました。' }));
    throw new Error((err as { error: string }).error ?? 'OCR処理に失敗しました。');
  }

  return response.json() as Promise<OcrResult>;
}
