# 教訓・判断記録

ハマりどころ・非自明な判断・次への教訓を蓄積するファイル。

「何をしたか」ではなく「なぜそうしたか・次回どうすべきか」を書く。

---

## 2026-05-12 初期実装 + ドキュメント整備

### アーキテクチャは固定ではないことを明示する重要性

本来 fundflow は「静的 Web アプリ（Vanilla JS）」として実装されていました。
ただし、実装が進むと以下のような要件が出てくる可能性があります。

- 複数シナリオの比較機能 → React / Vue でのコンポーネント化が有効
- TypeScript による型安全性向上
- webpack / Vite によるビルドプロセス導入
- localStorage でのシミュレーション履歴保存
- サーバーサイド計算（API 化）

**教訓**: ドキュメント（CLAUDE.md / .claude/rules/core.md）に「アーキテクチャは変わる可能性あり」と明記。
新人開発者・AI エージェントが「現在のテック スタックが今後の固定決定」と勘違いするのを防ぐ。

**次回への指針**: アーキテクチャを大きく変更する際は、以下を同時に更新する。
- CLAUDE.md（技術スタック・コマンド）
- .agents/AGENTS.md（よくある質問）
- .claude/rules/core.md（実装ルール）
- docs/DEVELOPMENT.md（セットアップ・デプロイ）
- docs/LESSONS.md（この判断理由）

### GitHub Pages デプロイの自動化

GitHub の Web UI だけで自動デプロイが完成するため、CI/CD ツール（GitHub Actions / Vercel）は不要。
このシンプルさは「Vanilla JS + HTML + CSS」という構成の大きなメリット。

**教訓**: ビルドプロセスが不要なアーキテクチャは保守コストが低い。
新機能追加時に「フレームワーク化したら〇〇が楽になる」という提案が出ても、
現在のシンプルさと比較してから判断するべき。

**次回への指針**: フレームワーク化を検討する際は、以下をコスト計算に含める。
- 開発者のオンボーディング時間（習熟期間）
- ビルドプロセスの保守コスト
- バージョン更新・セキュリティパッチの対応頻度
- バンドルサイズとパフォーマンス（CDN キャッシュ活用可）

### 計算ロジックの分離が重要

複利・単利の計算ロジックを DOM 操作から分離することで、以下が実現できました。

```javascript
// ✅ 純粋関数（テスト可能・再利用可能）
function calculateCompound(principal, monthly, annualRate, years) {
  // DOM 参照なし
  return results;
}

// ❌ 非純粋関数（テスト困難・変更に弱い）
function calculate() {
  const principal = document.getElementById('initial').value;
  document.getElementById('result').innerHTML = ...;
}
```

**教訳**: 関数の責務を明確に分離。ビューの変更がビジネスロジックに影響しないように。

**次回への指針**: Chart.js など外部ライブラリを追加する際も、「データ生成」と「可視化」を分離するべき。

---

## 将来実装の候補リスト

以下は実装検討の価値がある機能。優先度・難易度・効果を記録。

| 機能 | 説明 | 優先度 | 難易度 | 効果 | 実装予定 |
|------|------|--------|--------|------|---------|
| CSV エクスポート | シミュレーション結果を CSV で出力 | 低 | 低 | 中 | 検討中 |
| localStorage 保存 | 複数シミュレーションを保存・復元 | 中 | 中 | 高 | 検討中 |
| ダークモード | 深夜利用対応 | 低 | 低 | 低 | 保留 |
| 複数シナリオ比較 | 複数条件を同時表示 | 中 | 高 | 高 | React 化が有効 |
| 為替対応 | 外貨（USD / EUR）対応 | 低 | 中 | 低 | 見送り（subsuku 教訓参照） |
| Web Worker 化 | 大規模計算のオフロード | 低 | 高 | 低 | 不要（現在のスケールでは） |
| PWA 化 | オフラインアプリ化 | 低 | 中 | 中 | 将来検討 |
| GraphQL API | バックエンド化 | 低 | 高 | 低 | 不要（現在） |

---

## デバッグ記録

### issue-1: Chart.js CDN が読み込まれない（2026-05-11）

**症状**: グラフが表示されず、console に Chart is not defined

**原因**: async 属性で CDN スクリプトを読み込んでいたため、script.js が先に実行された

**解決法**: CDN script タグに async を削除、script.js の読み込みを後にした

```html
<!-- ❌ NG -->
<script src="https://cdn.jsdelivr.net/npm/chart.js" async></script>
<script src="script.js"></script>

<!-- ✅ OK -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="script.js"></script>
```

**教訓**: 依存関係がある場合は async 属性を避ける。読み込み順を明示的に制御。

---

## 次のセッションへのTODO

- [ ] `docs/LESSONS.md` にバグ報告・解決記録を追加
- [ ] アーキテクチャ変更の候補が出たら、cost-benefit 分析を記入
- [ ] ユーザーフィードバック（計算精度・UI など）を記録
