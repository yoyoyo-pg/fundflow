# Development Guide — FundFlow

## セットアップ

### 前提条件

- Git がインストールされていること
- Node.js v18+ がインストールされていること（推奨）
- 任意のブラウザ（Chrome / Safari / Firefox / Edge）

### ローカル開発環境の構築

```bash
# 1. リポジトリをクローン
git clone https://github.com/yoyoyo-pg/fundflow.git
cd fundflow

# 2. ローカルサーバーで実行（方法 A: npx serve）
npx serve .
# → http://localhost:3000 でアクセス可能

# または（方法 B: ブラウザで直接開く）
open index.html  # macOS
# または
start index.html  # Windows
# または
xdg-open index.html  # Linux
```

> **推奨**: `npx serve` を使用。CORS エラーや Chart.js CDN 読み込みの問題が回避できます。

## 開発フロー

### 1. ブランチ作成

```bash
# main ブランチを最新に保つ
git checkout main
git pull origin main

# 新しいフィーチャーブランチを作成
git checkout -b claude/feature-name
# または
git checkout -b feature/feature-name
```

> **命名規則**: `claude/<作業内容>` または `feature/<作業内容>`

### 2. 変更・検証

```bash
# エディターで変更
# index.html / script.js / style.css を編集

# ブラウザで動作確認（DevTools F12 で console をチェック）
# http://localhost:3000 をリロード

# 複利・単利計算で確認
# グラフが正しくレンダリングされているか確認
# スマホブラウザ（DevTools のレスポンシブモード）で確認
```

### 3. コミット・プッシュ

```bash
# 変更をステージング
git add .

# コミット（明確なメッセージ）
git commit -m "feat: 複利計算ロジックを改善"
# または
git commit -m "docs: CLAUDE.md を更新"
# または
git commit -m "style: CSS でレスポンシブ対応を追加"

# リモートにプッシュ
git push origin claude/feature-name
```

### 4. Pull Request

GitHub Web UI で PR を作成し、レビューを待ちます。

```bash
# レビュー後、main にマージ
# GitHub UI で "Squash and merge" を選択
```

> **自動デプロイ**: main へのマージ後、GitHub Actions が GitHub Pages へ自動公開します。

## デバッグのコツ

### 1. DevTools を使う

```javascript
// DevTools > Console で計算をテスト（利率は小数: 5% → 0.05）
buildYearlyData(100000, 10000, 0.05, 10)
// 出力: [{ year: 1, principal: 220000, profit: 11000, total: 231000 }, ...]
```

### 2. Chrome DevTools Network タブ

```
URL: https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
Status: 200 OK
→ CDN の読み込み成功を確認
```

### 3. ブレークポイントを設定

```javascript
// script.js 内で debugger 文を挿入
debugger;  // DevTools > Sources でここで停止
```

## よくあるトラブル

| 症状 | 原因 | 解決法 |
|------|------|--------|
| グラフが表示されない | Chart.js CDN 読み込み遅延 | DevTools > Network で確認 |
| `Uncaught ReferenceError: Chart is not defined` | script タグの読み込み順序 | `<script src="https://..." async></script>` の後に `<script src="script.js"></script>` |
| 計算結果が NaN | 文字列型の数値を演算 | `parseFloat(document.getElementById(...).value)` で変換 |
| スマホで UI が崩れる | CSS メディアクエリ不足 | DevTools レスポンシブモード（max-width: 768px）で検証 |
| localhost:3000 に接続できない | ポート競合 | `npx serve . --port 3001` で別ポートで実行 |

## パフォーマンス最適化

### 現在の最適化

- Chart.js は CDN から読み込み（キャッシュ活用）
- 計算ロジックは純粋関数（再計算が高速）
- インラインスクリプト（外部 JS 読み込み不要）

### 将来の最適化案

- Web Worker で大規模計算をオフロード
- Canvas レンダリングの最適化
- localStorage でシミュレーション結果をキャッシュ

## テスト（現在）

手動テスト のみ。自動テストフレームワークは未導入。

```
✅ 複利計算: 初期10万・月1万・5年利率5%で検証
✅ 単利計算: 初期10万・月1万・5年利率5%で検証
✅ グラフ描画: Canvas に line chart が表示されること
✅ レスポンシブ: 画面幅 1920px / 768px / 375px で崩れていないこと
```

将来的に Vitest などの導入を検討可。

## デプロイ

### 自動デプロイ（推奨）

```bash
# 1. main ブランチにマージ
git checkout main
git merge --squash claude/feature-name
git push origin main

# 2. GitHub Actions が自動実行
# → https://yoyoyo-pg.github.io/fundflow/ が更新される
```

### 手動デプロイ（緊急時）

```bash
# GitHub Settings > Pages > Source を確認
# デフォルトは main branch → GitHub Pages

# 公開されているか確認
curl -s https://yoyoyo-pg.github.io/fundflow/ | head -20
```

## ファイル構成の詳細

```
fundflow/
├── index.html         # メイン HTML（マークアップ・タブナビゲーション）
├── style.css          # グローバルスタイル
├── script.js          # 計算ロジック・イベントハンドラー（3シミュレーター分）
├── manifest.json      # PWA マニフェスト
├── icons/             # アプリアイコン
├── README.md          # プロジェクト概要・計算式
├── CLAUDE.md          # AI エージェント向けガイド
├── .agents/
│   └── AGENTS.md      # AI タスク指示書
├── .claude/
│   ├── rules/
│   │   └── core.md    # コンテキスト注入用ルール
│   ├── skills/        # Claude Code カスタムスキル
│   └── agents/        # Claude Code カスタムエージェント
├── docs/
│   ├── DEVELOPMENT.md # このファイル
│   └── LESSONS.md     # 教訓・gotchas
└── .gitignore        # Git 除外ファイル
```

## 参考リンク

- [README.md](../README.md) — プロジェクト概要・計算式
- [CLAUDE.md](../CLAUDE.md) — 技術スタック・行動原則
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/) — グラフライブラリ
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/) — JavaScript 標準仕様

