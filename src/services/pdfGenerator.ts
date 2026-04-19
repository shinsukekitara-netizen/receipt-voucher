import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { VoucherData } from '../types/voucher';

export async function generatePdf(
  voucherElement: HTMLElement,
  _voucher: VoucherData
): Promise<Blob> {
  // フォントのロード完了を待機（必須：日本語フォントの確実なレンダリング）
  await document.fonts.ready;

  const canvas = await html2canvas(voucherElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');

  // A4縦: 210mm × 297mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();   // 210
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
  const margin = 15;

  const contentWidth = pdfWidth - margin * 2;
  const imgRatio = canvas.height / canvas.width;
  const contentHeight = contentWidth * imgRatio;

  // アスペクト比を維持しながら、ページに収まるよう縮小
  if (contentHeight <= pdfHeight - margin * 2) {
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
  } else {
    const scale = (pdfHeight - margin * 2) / contentHeight;
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      contentWidth * scale,
      (pdfHeight - margin * 2)
    );
  }

  return pdf.output('blob');
}

export function buildFileName(voucher: VoucherData): string {
  const date = voucher.createdAt.replace(/-/g, '');
  const name = voucher.applicantName.replace(/[\\/:*?"<>|]/g, '_');
  return `出金依頼票_${date}_${name}.pdf`;
}
