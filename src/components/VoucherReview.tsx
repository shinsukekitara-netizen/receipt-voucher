import { useRef, useState } from 'react';
import { Edit3, CheckCircle, RotateCcw } from 'lucide-react';
import type { VoucherData } from '../types/voucher';
import VoucherTemplate from './VoucherTemplate';

interface Props {
  voucher: VoucherData;
  onConfirm: (updated: VoucherData) => void;
  onBack: () => void;
}

export default function VoucherReview({ voucher, onConfirm, onBack }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VoucherData>(voucher);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof VoucherData, value: string | number) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmountChange = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setDraft((prev) => ({
      ...prev,
      amount: num,
      amountText: `¥${num.toLocaleString()}`,
    }));
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-700">伝票を修正</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">編集モード</span>
        </div>

        {[
          { label: '申請者', field: 'applicantName' as const, type: 'text' },
          { label: '内容（使途）', field: 'purpose' as const, type: 'text' },
          { label: '支払先', field: 'payee' as const, type: 'text' },
          { label: '領収日 (YYYY-MM-DD)', field: 'receiptDate' as const, type: 'text' },
          { label: '品目・内訳', field: 'items' as const, type: 'text' },
        ].map(({ label, field, type }) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">{label}</label>
            <input
              type={type}
              value={draft[field] as string}
              onChange={(e) => handleChange(field, e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">金額（円）</label>
          <input
            type="number"
            value={draft.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => { setDraft(voucher); setEditing(false); }}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-600 font-bold active:scale-95 transition-all hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-navy-700 text-white font-bold active:scale-95 transition-all shadow-md hover:bg-navy-600"
          >
            <CheckCircle className="w-5 h-5" />
            修正を適用
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <h2 className="text-xl font-bold text-navy-700 mb-1">出金依頼票の確認</h2>
        <p className="text-sm text-gray-500">内容を確認し、問題なければ「OK・次へ」を押してください。</p>
      </div>

      {/* 伝票プレビュー（スクロール可能） */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
        <div style={{ minWidth: '320px' }}>
          <VoucherTemplate ref={templateRef} voucher={draft} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setEditing(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-navy-300 text-navy-700 font-bold active:scale-95 transition-all hover:bg-navy-50"
        >
          <Edit3 className="w-4 h-4" />
          修正する
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1 py-4 px-4 rounded-2xl border-2 border-gray-300 text-gray-500 font-bold active:scale-95 transition-all hover:bg-gray-50"
          title="最初からやり直す"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onConfirm(draft)}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-navy-700 text-white font-bold text-base active:scale-95 transition-all shadow-md hover:bg-navy-600"
      >
        <CheckCircle className="w-5 h-5" />
        OK・次へ
      </button>
    </div>
  );
}
