---
name: pr-check
description: PR提出前の確認チェックリストを表示し、未完了項目を特定する
---

以下の FundFlow PR チェックリストを実行してください。
git diff main...HEAD を確認して、各項目の完了状況を判定してください。

## PR チェックリスト

### 前提確認
- [ ] `index.html` + `script.js` の変更箇所を確認した
- [ ] 計算ロジック（buildYearlyData / buildDividendData / calculateRetirement）に変更がある場合、数値の精度を確認した

### ブランチ・コミット
- [ ] ブランチ名が `claude/<作業内容>` または `feature/<作業内容>`
- [ ] commit message が変更内容を明確に示している

### ドキュメント
- [ ] アーキテクチャ変更があれば CLAUDE.md を更新した
- [ ] 複雑なロジック追加があれば JSDoc コメントを追加した

未完了の項目があれば、何が必要かを具体的に教えてください。
