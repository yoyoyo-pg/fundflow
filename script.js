'use strict';

let chart = null;
let retirementChart = null;

function fmt(value) {
  return '¥' + Math.round(value).toLocaleString('ja-JP');
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  document.getElementById('tab-btn-' + tabId).classList.add('active');
}

// ── 投資シミュレーター ──────────────────────────────

function buildYearlyData(initial, monthly, rate, years) {
  const rows = [];
  let principal = initial;
  let total = initial;

  for (let y = 1; y <= years; y++) {
    // 年初に積立分を追加してから年利を適用（年次複利）
    total = (total + monthly * 12) * (1 + rate);
    principal += monthly * 12;
    rows.push({
      year: y,
      principal: Math.round(principal),
      profit: Math.round(total - principal),
      total: Math.round(total),
    });
  }
  return rows;
}

function calculate() {
  const initial = parseFloat(document.getElementById('initialAmount').value) || 0;
  const monthly = parseFloat(document.getElementById('monthlyAmount').value) || 0;
  const rate = (parseFloat(document.getElementById('annualRate').value) || 0) / 100;
  const years = parseInt(document.getElementById('years').value) || 1;
  const currentAge = parseInt(document.getElementById('currentAge').value) || 0;

  const data = buildYearlyData(initial, monthly, rate, years);

  const last = data[data.length - 1];
  const multiplier = last.principal > 0 ? (last.total / last.principal).toFixed(2) : '—';

  document.getElementById('totalPrincipal').textContent = fmt(last.principal);
  document.getElementById('totalProfit').textContent = fmt(last.profit);
  document.getElementById('totalAmount').textContent = fmt(last.total);
  document.getElementById('multiplier').textContent = multiplier + '倍';

  renderInvestmentChart(data, currentAge);
  renderInvestmentTable(data, currentAge);
  document.getElementById('results').style.display = '';
}

function renderInvestmentChart(data, currentAge) {
  if (chart) chart.destroy();
  const ctx = document.getElementById('growthChart').getContext('2d');
  const labels = data.map(r =>
    currentAge > 0 ? (currentAge + r.year) + '歳' : r.year + '年'
  );
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '資産合計',
          data: data.map(r => r.total),
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          borderWidth: 2.5,
          pointRadius: data.length <= 20 ? 4 : 2,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35,
        },
        {
          label: '元本',
          data: data.map(r => r.principal),
          borderColor: '#CBD5E1',
          backgroundColor: 'rgba(203, 213, 225, 0.2)',
          borderWidth: 2,
          pointRadius: data.length <= 20 ? 3 : 1,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.1,
          borderDash: [6, 3],
        },
      ],
    },
    options: chartOptions(v => {
      if (v >= 100_000_000) return (v / 100_000_000).toFixed(0) + '億';
      if (v >= 10_000) return (v / 10_000).toFixed(0) + '万';
      return v;
    }),
  });
}

function renderInvestmentTable(data, currentAge) {
  const showAge = currentAge > 0;
  document.querySelector('#tab-investment thead tr').cells[0].textContent =
    showAge ? '年齢' : '年';
  document.getElementById('tableBody').innerHTML = data.map(r => `
    <tr>
      <td>${showAge ? (currentAge + r.year) + '歳' : r.year}</td>
      <td>${fmt(r.principal)}</td>
      <td>${fmt(r.profit)}</td>
      <td>${fmt(r.total)}</td>
    </tr>
  `).join('');
}

// ── 老後資金シミュレーター ────────────────────────────

function calculateRetirement() {
  const expenses  = parseFloat(document.getElementById('r-expenses').value) || 0;
  const pension   = parseFloat(document.getElementById('r-pension').value) || 0;
  const retireAge = parseInt(document.getElementById('r-retirementAge').value) || 65;
  const lifeAge   = parseInt(document.getElementById('r-lifeExpectancy').value) || 90;
  const severance = parseFloat(document.getElementById('r-severance').value) || 0;

  const period        = Math.max(0, lifeAge - retireAge);
  const totalExpenses = expenses * 12 * period;
  const totalPension  = pension * 12 * period;
  const totalIncome   = totalPension + severance;
  const selfFunding   = totalExpenses - totalIncome;
  const isSurplus     = selfFunding <= 0;

  document.getElementById('r-period-val').textContent   = period + '年';
  document.getElementById('r-totalExpenses').textContent = fmt(totalExpenses);
  document.getElementById('r-totalIncome').textContent   = fmt(totalIncome);

  const selfEl    = document.getElementById('r-selfFunding');
  const labelEl   = document.getElementById('r-self-label');
  const selfCard  = document.getElementById('r-self-card');
  const surplusMsg = document.getElementById('r-surplus-msg');

  if (isSurplus) {
    labelEl.textContent    = '余剰額';
    selfEl.textContent     = fmt(Math.abs(selfFunding));
    selfCard.className     = 'summary-card r-self surplus';
    surplusMsg.style.display = '';
  } else {
    labelEl.textContent    = '自己準備が必要な額';
    selfEl.textContent     = fmt(selfFunding);
    selfCard.className     = 'summary-card r-self deficit';
    surplusMsg.style.display = 'none';
  }

  const annualGap = (expenses - pension) * 12;
  const startBalance = isSurplus ? Math.max(0, annualGap) * period : selfFunding;
  const rows = [];

  for (let y = 0; y <= period; y++) {
    const balance = Math.max(0, startBalance - annualGap * y);
    rows.push({
      age:           retireAge + y,
      annualExpenses: expenses * 12,
      annualPension:  pension * 12,
      annualGap:      Math.max(0, annualGap),
      balance,
      cumulativePension: pension * 12 * y + severance,
    });
  }

  renderRetirementChart(rows);
  renderRetirementTable(rows);
  document.getElementById('r-results').style.display = '';
}

function renderRetirementChart(rows) {
  if (retirementChart) retirementChart.destroy();
  const ctx = document.getElementById('retirementChart').getContext('2d');
  retirementChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: rows.map(r => r.age + '歳'),
      datasets: [
        {
          label: '残資産',
          data: rows.map(r => r.balance),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          borderWidth: 2.5,
          pointRadius: rows.length <= 30 ? 3 : 2,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.2,
        },
        {
          label: '年金累計',
          data: rows.map(r => r.cumulativePension),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderWidth: 2,
          pointRadius: rows.length <= 30 ? 2 : 1,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.2,
          borderDash: [5, 3],
        },
      ],
    },
    options: chartOptions(v => {
      if (v >= 100_000_000) return (v / 100_000_000).toFixed(0) + '億';
      if (v >= 10_000) return (v / 10_000).toFixed(0) + '万';
      return v;
    }),
  });
}

function renderRetirementTable(rows) {
  document.getElementById('r-tableBody').innerHTML = rows.map(r => `
    <tr>
      <td>${r.age}</td>
      <td>${fmt(r.annualExpenses)}</td>
      <td>${fmt(r.annualPension)}</td>
      <td>${r.annualGap > 0 ? fmt(r.annualGap) : '<span style="color:var(--success)">—</span>'}</td>
      <td>${fmt(r.balance)}</td>
    </tr>
  `).join('');
}

// ── 共通チャートオプション ────────────────────────────

function chartOptions(yFormatter) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
        },
        backgroundColor: '#1E293B',
        titleColor: '#94A3B8',
        bodyColor: '#F8FAFC',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { size: 11 } },
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: {
          color: '#94A3B8',
          font: { size: 11 },
          callback: yFormatter,
        },
      },
    },
  };
}

document.addEventListener('DOMContentLoaded', () => {
  calculate();
  calculateRetirement();
});
