import type { AppStep } from '../types/voucher';
import { STEP_NUMBER, TOTAL_STEPS } from '../types/voucher';

interface Props {
  currentStep: AppStep;
}

const STEP_LABELS: Record<number, string> = {
  1: '画像取得',
  2: '情報入力',
  3: '確認',
  4: '保存確認',
  5: '完了',
};

export default function StepIndicator({ currentStep }: Props) {
  const current = STEP_NUMBER[currentStep];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">
          Step {current} / {TOTAL_STEPS}
        </span>
        <span className="text-xs text-navy-700 font-semibold">
          {STEP_LABELS[current]}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step < current
                ? 'bg-navy-700'
                : step === current
                ? 'bg-navy-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
