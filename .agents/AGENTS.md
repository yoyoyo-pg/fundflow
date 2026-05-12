# FundFlow for AI Agents

Claude・その他の AI エージェント向けの作業指示書。タスク開始前に必読。

## 優先度ルール

1. **既存コードを読むまで書かない**  
   `index.html` + `script.js` を確認してから着手。計算ロジックとビューの依存関係を理解する。

2. **アーキテクチャは固定ではない**  
   現在は Vanilla JS ですが、将来的にフレームワーク化・TypeScript 化・ビルド導入が起こる可能性があります。  
   実装中に「フレームワーク化の方が効率的」と判断したら、相談してください。

3. **計算ロジック > UI**  
   複利計算が正確であることが最優先。グラフ描画やUI改善は二次的です。

4. **ブラウザで動作確認してから完了とする**  
   複利・単利の両方で計算結果を確認し、グラフと表の整合性をチェック。

## よくある質問と回答

| Q | A |
|---|---|
| フレームワーク（React・Vue）は使える？ | 現在はいいえ。ただし将来化が提案される可能性あり。CLAUDE.md のアーキテクチャ欄を確認。 |
| TypeScript は？ | 現在はいいえ。JSDoc コメントで型アノテーション可。 |
| バックエンド API は？ | すべてクライアント側で計算。API 不要、オフライン完全対応。 |
| CSV エクスポート・データ保存は？ | localStorage で可能ですが、現在は実装されていません。 |
| Chart.js のバージョン更新は？ | CDN 版を使用のため、`<script>` タグの src を変更するだけで対応可。 |
| モバイル対応は必須？ | はい。`max-width: 768px` のメディアクエリで検証してください。 |

## タスクテンプレート

```markdown
## タスク: [機能名]

### 前提確認
- [ ] CLAUDE.md の「技術スタック」「ファイル構成」を読んだ
- [ ] `index.html` + `script.js` の既存コードを確認した
- [ ] 計算ロジックとビューの関連箇所を特定した

### 実装
- [ ] `script.js` のロジック変更（あれば）
- [ ] `index.html` のマークアップ・インラインスクリプト変更（あれば）
- [ ] `style.css` のスタイル追加・修正（あれば）

### 検証
- [ ] ローカルでブラウザを開き、正常に動作することを確認
- [ ] 複利計算で結果が正しいことを確認
- [ ] 単利計算で結果が正しいことを確認
- [ ] グラフが正しくレンダリングされていることを確認
- [ ] モバイルブラウザで崩れていないことを確認

### ドキュメント
- [ ] CLAUDE.md に変更があれば更新
- [ ] 複雑なロジック追加があれば JSDoc コメントを追加

### PR ふりかえり
- [ ] ブランチ名が `claude/<作業内容>` または `feature/<作業内容>`
- [ ] commit message が明確
```

## セッション初期化

```bash
# 毎セッション実行推奨
git fetch --prune
git branch --show-current
git log --oneline -3
```

## よくあるハマりどころ

### Chart.js が読み込めない

**症状**: グラフが表示されない、コンソールエラーなし

**原因**: CDN の読み込み遅延、またはスクリプトの実行順序

**対処法**:
```javascript
// ❌ NGパターン
window.addEventListener('load', () => {
  // Chart.js CDN の読み込みがまだ完了していない可能性
  const chart = new Chart(ctx, config);
});

// ✅ OK パターン（script タグで Chart.js を先に読み込む）
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// <script src="script.js"></script>
```

### 計算結果がNaNになる

**症状**: グラフが表示されない、データが不正

**原因**: `parseFloat()` / `parseInt()` の失敗、または数値型の混在

**対処法**:
```javascript
// ❌ NGパターン
const rate = "5" / 12 / 100;  // "5" は文字列型

// ✅ OK パターン
const rate = parseFloat("5") / 12 / 100;
// または
const rate = Number("5") / 12 / 100;
```

### スマホで UIが崩れる

**症状**: フォーム・ボタン・グラフが重なる

**対処法**:
```css
/* メディアクエリで対応 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
  
  .input-group {
    flex-direction: column;
    width: 100%;
  }
}
```

## 参考リンク

- [CLAUDE.md](../CLAUDE.md) — 技術スタック・行動原則
- [README.md](../README.md) — プロジェクト概要・計算式
- [Chart.js ドキュメント](https://www.chartjs.org/docs/latest/) — グラフライブラリ
