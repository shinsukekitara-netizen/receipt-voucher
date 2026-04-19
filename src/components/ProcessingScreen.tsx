import { useEffect, useState } from 'react';
import { runOcr } from '../services/ocrService';
import type { OcrResult } from '../types/voucher';
import { ScanLine, Brain, FileCheck } from 'lucide-react';

interface Props {
  imageBase64: string;
  imageMimeType: string;
  onComplete: (result: OcrResult) => void;
  onError: (message: string) => void;
}

const STEPS = [
  { icon: ScanLine, label: '画像を解析しています...' },
  { icon: Brain, label: 'AIが情報を読み取っています...' },
  { icon: FileCheck, label: '伝票データを生成しています...' },
];

export default function ProcessingScreen({ imageBase64, imageMimeType, onComplete, onError }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 2000);

    runOcr(imageBase64, imageMimeType)
      .then((result) => {
        if (!cancelled) { clearInterval(interval); onComplete(result); }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          clearInterval(interval);
          onError(err instanceof Error ? err.message : 'OCR処理中にエラーが発生しました。');
        }
      });

    return () => { cancelled = true; clearInterval(interval); };
  }, [imageBase64, imageMimeType, onComplete, onError]);

  const CurrentIcon = STEPS[stepIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-5">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-28 h-28 rounded-full bg-navy-100 animate-ping opacity-30" />
        <div className="w-24 h-24 rounded-full bg-navy-50 border-4 border-navy-200 flex items-center justify-center shadow-lg">
          <CurrentIcon className="w-10 h-10 text-navy-600 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-navy-700 mb-1">Claude AI 解析中</p>
        <p className="text-sm text-gray-500">{STEPS[stepIndex].label}</p>
      </div>
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-navy-600 scale-110' : 'bg-gray-300'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center px-8">
        Claude AIがレシートの情報を自動で読み取っています。
      </p>
    </div>
  );
}
