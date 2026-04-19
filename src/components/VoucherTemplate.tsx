import { forwardRef } from 'react';
import type { VoucherData } from '../types/voucher';

interface Props {
  voucher: VoucherData;
}

function toReiwa(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return { year: y - 2018, month: m, day: d };
}

function formatReiwa(dateStr: string, fallback = ''): string {
  const r = toReiwa(dateStr);
  if (!r) return fallback;
  return `令和${r.year}年${r.month}月${r.day}日`;
}

const VoucherTemplate = forwardRef<HTMLDivElement, Props>(({ voucher }, ref) => {
  const createdReiwa = toReiwa(voucher.createdAt);
  const createdLabel = createdReiwa
    ? `令和${createdReiwa.year}年${createdReiwa.month}月${createdReiwa.day}日`
    : '';

  const amountDisplay = voucher.amount > 0
    ? `${voucher.amount.toLocaleString()}円`
    : voucher.amountText || '';

  return (
    <div
      ref={ref}
      style={{
        width: '595px',
        minHeight: '842px',
        backgroundColor: '#ffffff',
        padding: '40px 48px',
        fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
        fontSize: '13px',
        color: '#000',
        boxSizing: 'border-box',
      }}
    >
      {/* タイトル */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.15em' }}>
          土塔町西自治会　出金依頼票
        </span>
      </div>

      {/* 日付（右寄せ） */}
      <div style={{ textAlign: 'right', marginBottom: '18px', fontSize: '13px' }}>
        {createdLabel}
      </div>

      {/* 本文テーブル */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          {[
            { label: '申請者', value: voucher.applicantName },
            { label: '金　額', value: amountDisplay },
            { label: '支払先', value: voucher.payee },
            { label: '内　容', value: voucher.purpose },
          ].map(({ label, value }) => (
            <tr key={label}>
              <td style={{
                border: '1px solid #000',
                padding: '10px 14px',
                width: '90px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                backgroundColor: '#f9f9f9',
              }}>
                {label}：
              </td>
              <td style={{
                border: '1px solid #000',
                padding: '10px 14px',
                fontSize: '14px',
              }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 下部3列ボックス */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            {[
              { header: '会計処理（出金日）', body: '令和　　年　　月　　日' },
              { header: '申請者あて支払日', body: '令和　　年　　月　　日' },
              { header: '申請者受領印', body: '' },
            ].map(({ header, body }) => (
              <td key={header} style={{
                border: '1px solid #000',
                padding: '0',
                width: '33.3%',
                verticalAlign: 'top',
              }}>
                <div style={{
                  borderBottom: '1px solid #000',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9',
                }}>
                  {header}
                </div>
                <div style={{
                  padding: '14px 10px',
                  fontSize: '11px',
                  minHeight: '44px',
                }}>
                  {body}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* 書類添付エリア */}
      <div style={{ marginTop: '4px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          【書類添付】
        </div>
        <div style={{
          borderTop: '1px solid #ccc',
          paddingTop: '8px',
        }}>
          {voucher.imageBase64 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={`data:${voucher.imageMimeType};base64,${voucher.imageBase64}`}
                alt="領収証"
                style={{
                  maxWidth: '100%',
                  maxHeight: '360px',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

VoucherTemplate.displayName = 'VoucherTemplate';
export default VoucherTemplate;
