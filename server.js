'use strict';

// ローカル開発時は .env を読み込む（本番環境では環境変数を直接設定）
try { require('dotenv').config(); } catch {}

const express = require('express');
const multer  = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs   = require('fs');

// ------------------------------------------------------------------ setup ---
const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('画像ファイルのみアップロード可能です'));
  },
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------------------- store ----
// 画像をメモリ上に一時保持（30分後に自動削除）
const imageStore = new Map();
const IMAGE_TTL  = 30 * 60 * 1000;

function storeImage(id, buffer, mimeType) {
  imageStore.set(id, { buffer, mimeType, createdAt: Date.now() });
  setTimeout(() => imageStore.delete(id), IMAGE_TTL);
}

// --------------------------------------------------------------- font -------
// フォント検索順: IPAexゴシック → Windows 同梱フォント → フォールバック
function resolveJapaneseFont() {
  const candidates = [
    { file: path.join(__dirname, 'fonts', 'ipaexg.ttf'),         face: null },
    { file: 'C:\\Windows\\Fonts\\meiryo.ttc',                    face: 'Meiryo' },
    { file: 'C:\\Windows\\Fonts\\YuGothR.ttc',                   face: 'YuGothic-Regular' },
    { file: 'C:\\Windows\\Fonts\\msgothic.ttc',                   face: 'MS-Gothic' },
    { file: '/usr/share/fonts/opentype/ipaexfont-gothic/ipaexg.ttf', face: null },
  ];
  return candidates.find(c => fs.existsSync(c.file)) || null;
}

// ----------------------------------------------------------------- OCR ------
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '画像ファイルが必要です' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ success: false, error: 'ANTHROPIC_API_KEY が設定されていません' });
  }

  const { buffer, mimetype } = req.file;
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  storeImage(imageId, buffer, mimetype);

  const prompt = `このレシート画像を解析してください。以下のJSONのみを返してください。前置き・説明・バッククォートは一切不要です。

{"date":"YYYY-MM-DD","store_name":"店舗名","amount":1234,"items":"品目の説明"}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimetype, data: buffer.toString('base64') },
          },
          { type: 'text', text: prompt },
        ],
      }],
    });

    const raw = msg.content[0].text.trim();
    let ocr;
    try {
      ocr = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*?\}/);
      if (m) ocr = JSON.parse(m[0]);
      else throw new Error('OCR結果のJSONパースに失敗しました');
    }

    res.json({ success: true, imageId, ocr });
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------- PDF --------
app.post('/api/generate-pdf', async (req, res) => {
  const { imageId, formData } = req.body || {};

  const imgData = imageId ? imageStore.get(imageId) : null;
  if (!imgData) {
    return res.status(400).json({
      success: false,
      error: '画像が見つかりません。ページを再読み込みして再度アップロードしてください。',
    });
  }

  try {
    const pdfBuf = await buildPDF(formData, imgData.buffer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      "attachment; filename*=UTF-8''%E5%87%BA%E9%87%91%E4%BE%9D%E9%A0%BC%E7%A5%A8.pdf",
    );
    res.send(pdfBuf);
  } catch (err) {
    console.error('PDF error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------- PDF builder -----
function buildPDF(form, imageBuffer) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      info: { Title: '出金依頼票', Author: '土塔町西自治会' },
    });

    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // フォント登録
    const fontInfo = resolveJapaneseFont();
    if (fontInfo) {
      try {
        if (fontInfo.face) {
          doc.registerFont('J', fontInfo.file, fontInfo.face);
        } else {
          doc.registerFont('J', fontInfo.file);
        }
        doc.font('J');
      } catch (e) {
        console.warn('Font registration failed:', e.message);
      }
    } else {
      console.warn('日本語フォントが見つかりません。npm run setup-font を実行してください。');
    }

    const PAGE_W  = 595.28;
    const PAGE_H  = 841.89;
    const ML      = 40;          // left margin
    const MR      = 40;          // right margin
    const MT      = 40;          // top margin
    const MB      = 40;          // bottom margin
    const CW      = PAGE_W - ML - MR;  // 515.28
    let   y       = MT;

    // ===================== HEADER =====================
    doc.fontSize(18)
       .text('土塔町西自治会　出金依頼票', ML, y, { width: CW, align: 'center' });

    // 日付（右上）
    doc.fontSize(11)
       .text(form.date_reiwa || '', PAGE_W - MR - 170, y + 4, { width: 170, align: 'right' });

    y += 32;
    doc.moveTo(ML, y).lineTo(PAGE_W - MR, y).lineWidth(1).stroke();
    y += 18;

    // ===================== TABLE =====================
    const LABEL_W = 80;
    const ROW_H   = 46;

    const rows = [
      { label: '申請者', value: form.applicant || '' },
      { label: '金　額', value: form.amount ? `${Number(form.amount).toLocaleString('ja-JP')}円` : '' },
      { label: '支払先', value: form.payee   || '' },
      { label: '内　容', value: form.purpose || '' },
    ];

    rows.forEach(({ label, value }) => {
      // 行の枠
      doc.rect(ML, y, CW, ROW_H).lineWidth(0.5).stroke();
      // ラベル／値の区切り線
      doc.moveTo(ML + LABEL_W, y).lineTo(ML + LABEL_W, y + ROW_H).stroke();

      const textY = y + ROW_H / 2 - 7;
      doc.fontSize(12)
         .text(label, ML + 6, textY, { width: LABEL_W - 10, lineBreak: false });
      doc.fontSize(12)
         .text(value, ML + LABEL_W + 10, textY,
               { width: CW - LABEL_W - 14, lineBreak: false });
      y += ROW_H;
    });

    y += 28;

    // ===================== 下部 3ボックス =====================
    const BOX_H = 68;
    const BOX_W = Math.floor(CW / 3);

    const boxes = [
      { title: '会計処理（出金日）', sub: '令和　　年　　月　　日' },
      { title: '申請者あて支払日',   sub: '令和　　年　　月　　日' },
      { title: '申請者受領印',       sub: '' },
    ];

    boxes.forEach(({ title, sub }, i) => {
      const bx = ML + i * BOX_W;
      doc.rect(bx, y, BOX_W, BOX_H).lineWidth(0.5).stroke();
      doc.fontSize(9).text(title, bx + 4, y + 10, { width: BOX_W - 8, align: 'center' });
      if (sub) {
        doc.fontSize(9).text(sub, bx + 4, y + 40, { width: BOX_W - 8, align: 'center' });
      }
    });

    y += BOX_H + 22;

    // ===================== 書類添付 =====================
    doc.fontSize(12).text('【書類添付】', ML, y);
    y += 22;
    doc.moveTo(ML, y).lineTo(PAGE_W - MR, y).lineWidth(0.5).stroke();
    y += 12;

    // レシート画像を埋め込み
    const maxImgW = CW;
    const maxImgH = PAGE_H - y - MB;

    if (imageBuffer && maxImgH > 30) {
      try {
        doc.image(imageBuffer, ML, y, {
          fit:   [maxImgW, maxImgH],
          align: 'center',
        });
      } catch (e) {
        console.warn('Image embed failed:', e.message);
        doc.fontSize(10).text('（レシート画像の埋め込みに失敗しました）', ML, y);
      }
    }

    doc.end();
  });
}

// ---------------------------------------------------------------- health -----
// Render / UptimeRobot などの死活監視用エンドポイント
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---------------------------------------------------------------- start -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅  サーバー起動完了: http://localhost:${PORT}\n`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY が設定されていません。OCR機能が使えません。');
  }
});
