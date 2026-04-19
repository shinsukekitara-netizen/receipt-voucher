import { useState } from 'react';
import { ArrowRight, User, FileText, Store, Banknote, Calendar } from 'lucide-react';

interface FormData {
  applicantName: string;
  purpose: string;
  payee: string;
  amount: string;
  receiptDate: string;
}

interface Props {
  initial?: Partial<FormData>;
  onNext: (data: FormData) => void;
  onBack: () => void;
}

export default function InfoInput({ initial = {}, onNext, onBack }: Props) {
  const [form, setForm] = useState<FormData>({
    applicantName: initial.applicantName ?? '',
    purpose:       initial.purpose       ?? '',
    payee:         initial.payee         ?? '',
    amount:        initial.amount        ?? '',
    receiptDate:   initial.receiptDate   ?? '',
  });

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const canProceed =
    form.applicantName.trim() !== '' &&
    form.purpose.trim() !== '' &&
    form.payee.trim() !== '' &&
    form.amount.trim() !== '' &&
    form.receiptDate.trim() !== '';

  const fields: { key: keyof FormData; label: string; placeholder: string; icon: React.ReactNode; type?: string }[] = [
    { key: 'applicantName', label: '申請者氏名',    placeholder: '例: 山田 太郎',       icon: <User      className="w-4 h-4 text-navy-600" /> },
    { key: 'purpose',       label: '内容（使途）',   placeholder: '例: 保険料、切手',    icon: <FileText  className="w-4 h-4 text-navy-600" /> },
    { key: 'payee',         label: '支払先',         placeholder: '例: ○○郵便局',       icon: <Store     className="w-4 h-4 text-navy-600" /> },
    { key: 'amount',        label: '金額（円）',     placeholder: '例: 1500',            icon: <Banknote  className="w-4 h-4 text-navy-600" />, type: 'number' },
    { key: 'receiptDate',   label: '領収日',         placeholder: '',                   icon: <Calendar  className="w-4 h-4 text-navy-600" />, type: 'date' },
  ];

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <h2 className="text-xl font-bold text-navy-700 mb-1">伝票情報の入力</h2>
        <p className="text-sm text-gray-500">レシートを見ながら入力してください。</p>
      </div>

      {fields.map(({ key, label, placeholder, icon, type }) => (
        <div key={key} className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            {icon}
            {label}
            <span className="text-red-500">*</span>
          </label>
          <input
            type={type ?? 'text'}
            value={form[key]}
            onChange={set(key)}
            placeholder={placeholder}
            inputMode={type === 'number' ? 'numeric' : undefined}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition"
          />
        </div>
      ))}

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-600 font-bold active:scale-95 transition-all hover:bg-gray-50"
        >
          戻る
        </button>
        <button
          onClick={() => onNext(form)}
          disabled={!canProceed}
          className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-navy-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md hover:bg-navy-600"
        >
          確認へ
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
