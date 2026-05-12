# FundFlow Core Rules

コンテキスト自動注入用の基本ルール。セッション開始時に読み込まれます。

## プロジェクト性質

| 項目 | 詳細 |
|------|------|
| **プロジェクト名** | FundFlow（投資シミュレーター） |
| **プロジェクトタイプ** | 静的 Web アプリ（ビルドプロセスなし） |
| **主要機能** | 初期投資額・月次積立から将来資産を計算・グラフ化 |
| **ユーザー対象** | 投資初心者～中級者（金融リテラシー確認用） |

## 現在のテック スタック

> ⚠️ **アーキテクチャは変わる可能性があります**
>
> 下記は 2026-05-12 時点の構成です。フレームワーク化・TypeScript 導入などの検討が起こる場合は、CLAUDE.md と共に必ず更新してください。

```
├── HTML 5 + JavaScript（Vanilla）
├── CSS 3（バニラ、BEM など設定なし）
├── Chart.js 4（CDN）
└── GitHub Pages（ホスティング）
```

## ファイル配置ルール

| パス | 責務 |
|------|------|
| `index.html` | HTML マークアップ + インラインスクリプト |
| `script.js` | 計算ロジック・イベントハンドラー |
| `style.css` | グローバルスタイル（レスポンシブ含む） |

## 実装ルール

### 1. 計算ロジック

- **純粋関数で書く** — DOM 依存なし、再利用可能に
  ```javascript
  // ✅ OK
  function calculateMonthly(principal, monthly, annualRate, months) {
    const rate = annualRate / 12 / 100;
    // 計算処理...
    return results;
  }
  
  // ❌ NG
  function calculate() {
    const principal = document.getElementById('initial').value;
    // ...
  }
  ```

- **テスト可能な粒度** — 複利・単利・累積計算が独立している
- **数値精度** — `Math.round(value * 100) / 100` で小数第2位に統一

### 2. DOM 操作

- **id / class を用いたセレクタ選択** — `querySelector` / `querySelectorAll` 推奨
- **イベントリスナーは単一の init 関数で管理** — グローバルなリスナー登録を避ける
- **インラインスタイルは避ける** — CSS クラスで制御

### 3. グラフ描画（Chart.js）

- **チャート初期化は Calculate 後に実行** — 非同期の CDN 読み込み完了後
- **canvas 要素を複数持たない** — 現在は折れ線グラフ 1 個で十分
- **レジェンド・ラベルは見やすく** — y 軸は「円」「万円」など単位を明記

### 4. CSS

- **レスポンシブ対応** — `max-width: 768px` ブレークポイント
- **カラースキーム** — 特に指定なし（subdomain/daily-notify/subsuku と統一不要）
- **アクセシビリティ** — `aria-label`、コントラスト比 4.5:1 以上

## コード品質基準

| 基準 | 詳細 |
|------|------|
| **構文** | ES6+（const/let, arrow function, template literal） |
| **コメント** | JSDoc で関数シグネチャを明記 |
| **エラーハンドリング** | `try-catch` または `?.` optional chaining で防御的に |
| **パフォーマンス** | グラフ再描画時に `chart.destroy()` で前のインスタンスを破棄 |

```javascript
// JSDoc 例
/**
 * 複利で資産推移を計算
 * @param {number} principal - 初期投資額（円）
 * @param {number} monthly - 月次積立額（円）
 * @param {number} annualRate - 年利率（%、例: 5 = 5%）
 * @param {number} years - シミュレーション期間（年）
 * @returns {Array<{year, balance, gain}>} 年別推移データ
 */
function calculateCompound(principal, monthly, annualRate, years) {
  // ...
}
```

## デプロイ・CI/CD

| 項目 | 詳細 |
|------|------|
| **自動デプロイ** | main ブランチへの push → GitHub Pages へ自動公開 |
| **本番環境** | https://yoyoyo-pg.github.io/fundflow/ |
| **デプロイ前チェック** | ローカルでブラウザで動作確認（複利・単利・グラフすべて） |

## アーキテクチャ変更時のチェックリスト

将来、フレームワーク化・型安全性向上・ビルドツール導入が起こる場合:

- [ ] CLAUDE.md を更新（技術スタック・コマンド・ファイル構成）
- [ ] .agents/AGENTS.md を更新（質問と回答）
- [ ] .claude/rules/core.md を更新（ルール・コード品質基準）
- [ ] docs/DEVELOPMENT.md を更新（セットアップ・コマンド）
- [ ] docs/LESSONS.md に変更理由を記録

## 参考ファイル

- `README.md` — プロジェクト概要・計算式
- `CLAUDE.md` — AI エージェント向けガイド
- `.agents/AGENTS.md` — AI タスク指示書
