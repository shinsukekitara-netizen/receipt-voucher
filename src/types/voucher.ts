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

export type AppStep =
  | 'image-capture'
  | 'info-input'
  | 'voucher-review'
  | 'save-confirmation'
  | 'complete';

export const STEP_NUMBER: Record<AppStep, number> = {
  'image-capture': 1,
  'info-input': 2,
  'voucher-review': 3,
  'save-confirmation': 4,
  'complete': 5,
};

export const TOTAL_STEPS = 5;
