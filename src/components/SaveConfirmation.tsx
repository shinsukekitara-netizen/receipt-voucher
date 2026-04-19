import { CloudUpload, X } from 'lucide-react';

interface Props {
  onSaveToDrive: () => void;
  onSkip: () => void;
}

export default function SaveConfirmation({ onSaveToDrive, onSkip }: Props) {
  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="text-center pt-4">
        <div className="w-16 h-16 rounded-full bg-navy-50 border-2 border-navy-200 flex items-center justify-center mx-auto mb-4">
          <CloudUpload className="w-8 h-8 text-navy-600" />
        </div>
        <h2 className="text-xl font-bold text-navy-700 mb-2">Driveに保存しますか？</h2>
        <p className="text-sm text-gray-500">
          出金依頼票（PDF）と撮影したレシートを<br />Google Driveの共有フォルダに保存します。
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onSaveToDrive}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-navy-700 text-white font-bold text-base active:scale-95 transition-all shadow-md hover:bg-navy-600"
        >
          <CloudUpload className="w-5 h-5" />
          Google Driveに保存する
        </button>

        <button
          onClick={onSkip}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-gray-300 text-gray-600 font-bold text-base active:scale-95 transition-all hover:bg-gray-50"
        >
          <X className="w-5 h-5" />
          保存しないで完了
        </button>
      </div>
    </div>
  );
}
