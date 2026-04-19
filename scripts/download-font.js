/**
 * IPAexゴシックフォントをダウンロードして fonts/ ディレクトリに配置するスクリプト
 * 実行: npm run setup-font
 */
'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const AdmZip = require('adm-zip');

const FONT_DIR  = path.join(__dirname, '..', 'fonts');
const FONT_PATH = path.join(FONT_DIR, 'ipaexg.ttf');
const ZIP_URL   = 'https://moji.or.jp/wp-content/ipafont/IPAexfont/ipaexg00401.zip';

function download(url, redirectsLeft = 6) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 Node.js' } }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        if (redirectsLeft === 0) return reject(new Error('リダイレクト上限に達しました'));
        return download(res.headers.location, redirectsLeft - 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

async function main() {
  if (fs.existsSync(FONT_PATH)) {
    console.log('✅  IPAexゴシックフォントは既にインストール済みです:', FONT_PATH);
    return;
  }

  if (!fs.existsSync(FONT_DIR)) {
    fs.mkdirSync(FONT_DIR, { recursive: true });
  }

  console.log('⬇️   IPAexゴシックフォントをダウンロード中...');
  console.log('    URL:', ZIP_URL);

  const zipBuf = await download(ZIP_URL);
  console.log(`    ダウンロード完了 (${(zipBuf.length / 1024).toFixed(0)} KB)`);

  const zip = new AdmZip(zipBuf);
  let ttfEntry = null;
  for (const entry of zip.getEntries()) {
    if (entry.entryName.endsWith('ipaexg.ttf')) {
      ttfEntry = entry;
      break;
    }
  }

  if (!ttfEntry) {
    throw new Error('ZIPファイル内に ipaexg.ttf が見つかりませんでした');
  }

  fs.writeFileSync(FONT_PATH, ttfEntry.getData());
  console.log('✅  フォントをインストールしました:', FONT_PATH);
}

main().catch(err => {
  console.error('\n❌  フォントの自動ダウンロードに失敗しました');
  console.error('   原因:', err.message);
  console.log('\n手動でインストールする場合:');
  console.log('  1. https://moji.or.jp/ipafont/ipaex.html を開く');
  console.log('  2. "IPAexゴシック" の zip をダウンロード');
  console.log('  3. 解凍した ipaexg.ttf を fonts/ フォルダに配置');
  console.log('\n※ Windowsの場合、メイリオ(meiryo.ttc)が自動的に使用されます。');
  process.exit(1);
});
