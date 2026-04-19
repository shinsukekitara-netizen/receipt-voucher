import { useState } from 'react';
import { ArrowRight, User, FileText } from 'lucide-react';

interface Props {
  initialName?: string;
  initialPurpose?: string;
  onNext: (applicantName: string, purpose: string) => void;
  onBack: () => void;
}

export default function InfoInput({ initialName = '', initialPurpose = '', onNext, onBack }: Props) {
  const [applicantName, setApplicantName] = useState(initialName);
  const [purpose, setPurpose] = useState(initialPurpose);

  const canProceed = applicantName.trim() !== '' && purpose.trim() !== '';

  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <h2 className="text-xl font-bold text-navy-700 mb-1">基本情報の入力</h2>
        <p className="text-sm text-gray-500">申請者と内容（使途）を入力してください。</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <User className="w-4 h-4 text-navy-600" />
          申請者氏名
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={applicantName}
          onChange={(e) => setApplicantName(e.target.value)}
          placeholder="例: 山田 太郎"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <FileText className="w-4 h-4 text-navy-600" />
          内容（使途）
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="例: 保険料、切手"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition"
        />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-600 font-bold active:scale-95 transition-all hover:bg-gray-50"
        >
          戻る
        </button>
        <button
          onClick={() => onNext(applicantName.trim(), purpose.trim())}
          disabled={!canProceed}
          className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-navy-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md hover:bg-navy-600"
        >
          次へ（AI解析）
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
