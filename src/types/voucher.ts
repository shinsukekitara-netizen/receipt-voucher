export interface VoucherData {
  applicantName: string;  // 申請者
  purpose: string;        // 内容（使途）
  payee: string;          // 支払先
  amount: number;
  amountText: string;
  receiptDate: string;
  items: string;
  createdAt: string;
  imageBase64: string;
  imageMimeType: string;
}

export interface OcrResult {
  payee: string;
  amount: number;
  amountText: string;
  receiptDate: string;
  items: string;
}

export type AppStep =
  | 'image-capture'
  | 'info-input'
  | 'processing'
  | 'voucher-review'
  | 'save-confirmation'
  | 'complete';

export const STEP_NUMBER: Record<AppStep, number> = {
  'image-capture': 1,
  'info-input': 2,
  'processing': 3,
  'voucher-review': 4,
  'save-confirmation': 5,
  'complete': 6,
};

export const TOTAL_STEPS = 6;
