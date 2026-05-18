---
name: calculation-verifier
description: FundFlow の計算関数を期待値と照合して正確性を検証する
---

FundFlow の script.js にある以下の3つの計算関数を検証してください。

## 検証対象関数

### buildYearlyData(initial, monthly, rate, years)

期待値テスト:
- initial=100000, monthly=10000, rate=0.05, years=1
  → total ≈ ¥226,280（年次複利）

### buildDividendData(initial, yieldRate, divGrowth, priceGrowth, years, reinvest)

期待値テスト:
- initial=1000000, yieldRate=0.035, divGrowth=0.07, priceGrowth=0.05, years=1, reinvest=false
  → annualDividend ≈ ¥35,000

### calculateRetirement の計算ロジック

期待値テスト:
- expenses=200000, pension=100000, retireAge=65, lifeAge=90
  → selfFunding = (200000-100000) × 12 × 25 = ¥30,000,000

script.js を読み込み、各関数の実際のロジックを追い、期待値との差異を報告してください。
差異がある場合は原因と修正案を示してください。
