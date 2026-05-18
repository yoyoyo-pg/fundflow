---
name: new-simulator
description: 新しいシミュレータータブ（HTML・JS・CSS）の雛形を生成する
---

引数として渡されたシミュレーター名（例: "NISA", "iDeCo"）を使って、
FundFlow の既存タブパターン（投資シミュレーター）に合わせた以下を生成してください：

1. `index.html` に追加するタブボタンとタブパネルの HTML
2. `script.js` に追加する計算関数・描画関数・テーブル描画関数のスケルトン（JSDoc 付き）

既存の `buildYearlyData` / `renderInvestmentChart` / `renderInvestmentTable` のパターンに従い、
変数名は `{シミュレーター名}-` プレフィックスを使用してください。
