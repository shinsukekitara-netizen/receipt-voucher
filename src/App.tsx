import { useRef, useState } from 'react';
import StepIndicator from './components/StepIndicator';
import ImageCapture from './components/ImageCapture';
import InfoInput from './components/InfoInput';
import VoucherReview from './components/VoucherReview';
import SaveConfirmation from './components/SaveConfirmation';
import CompletionScreen from './components/CompletionScreen';
import VoucherTemplate from './components/VoucherTemplate';
import type { AppStep, VoucherData } from './types/voucher';
import { generatePdf, buildFileName } from './services/pdfGenerator';
import { AlertCircle, Loader2 } from 'lucide-react';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function checkCanShare(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([''], 'test.pdf', { type: 'application/pdf' })] })
    );
  } catch {
    return false;
  }
}

export default function App() {
  const [step, setStep] = useState<AppStep>('image-capture');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFileName, setSavedFileName] = useState<string | undefined>(undefined);
  const [pdfSaved, setPdfSaved] = useState(false);

  const templateRef = useRef<HTMLDivElement>(null);
  const canShare = checkCanShare();

  // Step 1 → 2
  const handleImageNext = (base64: string, mimeType: string) => {
    setImageBase64(base64);
    setImageMimeType(mimeType);
    setStep('info-input');
  };

  // Step 2 → 3（直接確認画面へ）
  const handleInfoNext = (data: {
    applicantName: string;
    purpose: string;
    payee: string;
    amount: string;
    receiptDate: string;
  }) => {
    const amount = parseFloat(data.amount.replace(/,/g, '')) || 0;
    setVoucher({
      applicantName: data.applicantName,
      purpose:       data.purpose,
      payee:         data.payee,
      amount,
      amountText:    `¥${amount.toLocaleString('ja-JP')}`,
      receiptDate:   data.receiptDate,
      items:         '',
      createdAt:     today(),
      imageBase64,
      imageMimeType,
    });
    setStep('voucher-review');
  };

  // Step 3 確認 → 4
  const handleVoucherConfirm = (updated: VoucherData) => {
    setVoucher(updated);
    setStep('save-confirmation');
  };

  // Step 4 → PDFを保存/共有
  const handleSavePdf = async () => {
    if (!voucher || !templateRef.current) return;
    setSaving(true);
    setSaveError(null);
    try {
      const blob = await generatePdf(templateRef.current, voucher);
      const fileName = buildFileName(voucher);

      if (canShare) {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        await navigator.share({ files: [file], title: fileName });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setSavedFileName(fileName);
      setPdfSaved(true);
      setStep('complete');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setSaveError(err instanceof Error ? err.message : 'PDFの保存中にエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  };

  // Step 4 → スキップ
  const handleSkipSave = () => {
    setSavedFileName(voucher ? buildFileName(voucher) : undefined);
    setPdfSaved(false);
    setStep('complete');
  };

  // リセット
  const handleReset = () => {
    setStep('image-capture');
    setImageBase64('');
    setImageMimeType('image/jpeg');
    setVoucher(null);
    setSaveError(null);
    setSavedFileName(undefined);
    setPdfSaved(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-navy-700 text-white px-5 py-4 shadow-md">
        <h1 className="text-lg font-bold tracking-wide">出金依頼票作成</h1>
      </header>

      <StepIndicator currentStep={step} />

      <main className="flex-1 max-w-lg mx-auto w-full">
        {step === 'image-capture' && (
          <ImageCapture onNext={handleImageNext} />
        )}

        {step === 'info-input' && (
          <InfoInput
            initial={{
              applicantName: voucher?.applicantName,
              purpose:       voucher?.purpose,
              payee:         voucher?.payee,
              amount:        voucher?.amount ? String(voucher.amount) : '',
              receiptDate:   voucher?.receiptDate,
            }}
            onNext={handleInfoNext}
            onBack={() => setStep('image-capture')}
          />
        )}

        {step === 'voucher-review' && voucher && (
          <VoucherReview
            voucher={voucher}
            onConfirm={handleVoucherConfirm}
            onBack={() => setStep('info-input')}
          />
        )}

        {step === 'save-confirmation' && (
          <>
            {saveError && (
              <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{saveError}</p>
              </div>
            )}
            {saving ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-5">
                <Loader2 className="w-16 h-16 text-navy-600 animate-spin" />
                <p className="text-lg font-bold text-navy-700">PDFを生成中...</p>
              </div>
            ) : (
              <SaveConfirmation
                onSavePdf={handleSavePdf}
                onSkip={handleSkipSave}
                canShare={canShare}
              />
            )}
          </>
        )}

        {step === 'complete' && (
          <CompletionScreen
            fileName={savedFileName}
            saved={pdfSaved}
            onReset={handleReset}
          />
        )}
      </main>

      {voucher && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <VoucherTemplate ref={templateRef} voucher={voucher} />
        </div>
      )}
    </div>
  );
}
