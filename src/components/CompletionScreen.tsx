import { CheckCircle2, RefreshCcw, FileText } from 'lucide-react';

interface Props {
  fileName?: string;
  saved?: boolean;
  onReset: () => void;
}

export default function CompletionScreen({ fileName, saved, onReset }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 p-5 pt-10 text-center min-h-[70vh] justify-center">
      {/* 成功アイコン */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-navy-700 mb-2">伝票を作成しました！</h2>
        {saved ? (
          <p className="text-sm text-gray-500">出金伝票のPDFを保存しました。</p>
        ) : (
          <p className="text-sm text-gray-500">保存はスキップされました。</p>
        )}
      </div>

      {/* ファイル名 */}
      {fileName && (
        <div className="bg-gray-50 rounded-xl px-5 py-3 border border-gray-200 w-full flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-xs text-gray-400 mb-1">ファイル名</p>
            <p className="text-sm font-medium text-gray-700 break-all">{fileName}</p>
          </div>
        </div>
      )}

      {/* 新しい伝票を作成 */}
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-navy-700 text-white font-bold text-base active:scale-95 transition-all shadow-md hover:bg-navy-600"
      >
        <RefreshCcw className="w-5 h-5" />
        新しい伝票を作成
      </button>
    </div>
  );
}
