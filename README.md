# 出金依頼票 自動生成アプリ

レシートを撮影・アップロードすると、土塔町西自治会用の「出金依頼票」PDFを自動生成するWebアプリです。  
自治会員なら誰でも、スマートフォンのブラウザから利用できます。

---

## 🌐 Render.com（無料）でクラウド公開する手順

### 概要

```
あなたのPC → GitHub（コード保管） → Render.com（サーバー）
                                         ↑
                              自治会員がURLでアクセス
```

---

### STEP 1：GitHubにコードをアップロードする

1. **GitHubアカウントを作成**  
   https://github.com/ → "Sign up"

2. **新しいリポジトリを作成**  
   右上の「＋」→「New repository」  
   - Repository name: `receipt-voucher`  
   - **Private**（非公開）を選択  
   - 「Create repository」をクリック

3. **コードをアップロード**  
   ターミナル（PowerShell）で以下を実行：

   ```powershell
   cd C:\Users\shins\Documents\receipt-voucher

   git init
   git add .
   git commit -m "初回コミット"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/receipt-voucher.git
   git push -u origin main
   ```

---

### STEP 2：Render.comにデプロイする

1. **Render.comアカウントを作成**  
   https://render.com/ → "Get Started for Free"  
   → 「GitHub でサインアップ」を選択

2. **新しいWebサービスを作成**  
   ダッシュボード →「New」→「Web Service」  
   → 先ほどのGitHubリポジトリを選択

3. **設定を確認（自動検出されます）**

   | 項目 | 値 |
   |------|-----|
   | Name | doto-nishi-voucher（任意） |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Plan | **Free** |

4. **APIキーを設定**  
   「Environment」タブ → 「Add Environment Variable」  
   - Key: `ANTHROPIC_API_KEY`  
   - Value: `sk-ant-xxxxxxxx`（あなたのAPIキー）

5. **「Create Web Service」をクリック**  
   数分後にデプロイ完了。URLが発行されます：  
   `https://doto-nishi-voucher.onrender.com`

---

### STEP 3：自治会員にURLを共有する

発行されたURLを LINE / メール / 回覧板等でお知らせするだけです。

```
出金依頼票はこちらから作れます：
https://doto-nishi-voucher.onrender.com
（スマホのブラウザで開いてください）
```

---

## ⚠️ 無料プランの注意点

| 制限 | 内容 |
|------|------|
| スリープ | 15分間アクセスがないと停止。次のアクセス時に約30秒かかる |
| 月間使用時間 | 750時間/月（実質ほぼ無制限） |
| メモリ | 512MB（本アプリには十分） |

### スリープ対策（任意）

**UptimeRobot（無料）** を使うと、5分ごとに自動アクセスしてスリープを防げます。

1. https://uptimerobot.com/ に登録
2. 「Add New Monitor」→ HTTP(s)
3. URL: `https://doto-nishi-voucher.onrender.com/health`
4. 監視間隔: 5分

---

## 💻 ローカルで開発・テストする場合

```powershell
cd C:\Users\shins\Documents\receipt-voucher

# パッケージインストール（フォントも自動ダウンロード）
npm install

# .env ファイルを作成
copy .env.example .env
# .env を編集して ANTHROPIC_API_KEY を設定

# サーバー起動
npm start
```

ブラウザで http://localhost:3000 を開く。

---

## 📁 フォルダ構成

```
receipt-voucher/
  ├── server.js             # Express サーバー（OCR + PDF 生成）
  ├── render.yaml           # Render.com デプロイ設定
  ├── package.json
  ├── .env.example          # 環境変数サンプル
  ├── .gitignore
  ├── public/
  │   └── index.html        # フロントエンド（モバイルファースト）
  ├── scripts/
  │   └── download-font.js  # フォント自動ダウンロード
  └── fonts/
      └── ipaexg.ttf        # IPAexゴシック（自動ダウンロード）
```

---

## コードを更新するとき

コードを変更したら、以下を実行するだけで自動的に再デプロイされます：

```powershell
git add .
git commit -m "変更内容のメモ"
git push
```
