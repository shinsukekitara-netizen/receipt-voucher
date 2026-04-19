import { useRef, useState } from 'react';
import { Camera, FolderOpen, ArrowRight, ImageIcon } from 'lucide-react';

// Vercelの4.5MB制限に対応するため、base64後のサイズが約3MB以内になるよう
// 元画像を最大800KBに圧縮する（800KB × 1.33 ≒ 1.06MB）
const TARGET_SIZE_BYTES = 800 * 1024; // 800KB

interface Props {
  onNext: (imageBase64: string, mimeType: string) => void;
}

async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 長辺を最大1600pxに制限
        const MAX_DIM = 1600;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.floor(height * MAX_DIM / width);
            width = MAX_DIM;
          } else {
            width = Math.floor(width * MAX_DIM / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas取得失敗')); return; }
        ctx.drawImage(img, 0, 0, width, height);

        // 品質を下げながら TARGET_SIZE_BYTES 以下になるまで圧縮
        let quality = 0.8;
        let resizedDataUrl = canvas.toDataURL('image/jpeg', quality);

        while (resizedDataUrl.length * 0.75 > TARGET_SIZE_BYTES && quality > 0.3) {
          quality -= 0.1;
          resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const base64 = resizedDataUrl.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageCapture({ onNext }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await compressImage(file);
      setImageData(data);
      setPreview(`data:${data.mimeType};base64,${data.base64}`);
    } catch {
      setError('画像の読み込みに失敗しました。別の画像をお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <h2 className="text-xl font-bold text-navy-700 mb-1">レシートを取得</h2>
        <p className="text-sm text-gray-500">カメラで撮影するか、保存済み画像を選択してください。</p>
      </div>

      {/* 撮影・選択ボタン */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-navy-200 bg-navy-50 hover:border-navy-500 hover:bg-navy-100 active:scale-95 transition-all"
        >
          <Camera className="w-8 h-8 text-navy-600" />
          <span className="text-sm font-semibold text-navy-700">カメラで撮影</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:border-navy-400 hover:bg-navy-50 active:scale-95 transition-all"
        >
          <FolderOpen className="w-8 h-8 text-gray-500" />
          <span className="text-sm font-semibold text-gray-600">画像を選択</span>
        </button>
      </div>

      {/* 隠しinput */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* ローディング */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-500">画像を処理中...</span>
        </div>
      )}

      {/* プレビュー */}
      {preview && !loading && (
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <img src={preview} alt="レシートプレビュー" className="w-full object-contain max-h-72" />
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100">
            <ImageIcon className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">画像を読み込みました</span>
          </div>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 次へボタン */}
      <button
        onClick={() => imageData && onNext(imageData.base64, imageData.mimeType)}
        disabled={!imageData || loading}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-navy-700 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md hover:bg-navy-600"
      >
        次へ
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
