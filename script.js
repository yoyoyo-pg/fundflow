'use strict';

let chart = null;

function fmt(value) {
  return '¥' + Math.round(value).toLocaleString('ja-JP');
}

function getInterestType() {
  return document.querySelector('input[name="interestType"]:checked').value;
}

function buildYearlyData(initial, monthly, rate, years, isCompound) {
  const rows = [];
  let principal = initial;
  let total = initial;

  for (let y = 1; y <= years; y++) {
    if (isCompound) {
      // Each month: add contribution then apply monthly rate
      const monthlyRate = rate / 12;
      for (let m = 0; m < 12; m++) {
        total = (total + monthly) * (1 + monthlyRate);
        principal += monthly;
      }
    } else {
      // Simple interest: interest is always on original principal + contributions (no compounding)
      principal += monthly * 12;
      const interest = initial * rate * y + monthly * 12 * rate * (y - 0.5) * (y <= 1 ? 0 : 1);
      total = principal + initial * rate * y + monthly * 12 * rate * Math.max(0, y - 0.5);
    }

    rows.push({
      year: y,
      principal: Math.round(principal),
      profit: Math.round(total - principal),
      total: Math.round(total),
    });
  }

  return rows;
}

function buildYearlyDataSimple(initial, monthly, rate, years) {
  const rows = [];
  let principal = initial;

  for (let y = 1; y <= years; y++) {
    const annualContribution = monthly * 12;
    principal += annualContribution;

    // Simple interest: interest on initial deposit + weighted interest on contributions
    const interestOnInitial = initial * rate * y;
    // Contributions earn interest from mid-year on average for each year
    let interestOnContributions = 0;
    for (let k = 1; k <= y; k++) {
      interestOnContributions += annualContribution * rate * (y - k + 0.5);
    }
    const profit = interestOnInitial + interestOnContributions;
    const total = principal + profit;

    rows.push({
      year: y,
      principal: Math.round(principal),
      profit: Math.round(profit),
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
  const isCompound = getInterestType() === 'compound';

  const data = isCompound
    ? buildYearlyData(initial, monthly, rate, years, true)
    : buildYearlyDataSimple(initial, monthly, rate, years);

  const last = data[data.length - 1];
  const totalPrincipal = last.principal;
  const totalProfit = last.profit;
  const totalAmount = last.total;
  const multiplier = totalPrincipal > 0 ? (totalAmount / totalPrincipal).toFixed(2) : '—';

  document.getElementById('totalPrincipal').textContent = fmt(totalPrincipal);
  document.getElementById('totalProfit').textContent = fmt(totalProfit);
  document.getElementById('totalAmount').textContent = fmt(totalAmount);
  document.getElementById('multiplier').textContent = multiplier + '倍';

  renderChart(data);
  renderTable(data);

  document.getElementById('results').style.display = '';
}

function renderChart(data) {
  const labels = data.map(r => r.year + '年');
  const totals = data.map(r => r.total);
  const principals = data.map(r => r.principal);

  if (chart) chart.destroy();

  const ctx = document.getElementById('growthChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '資産合計',
          data: totals,
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
          data: principals,
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
    options: {
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
            callback: v => {
              if (v >= 100_000_000) return (v / 100_000_000).toFixed(0) + '億';
              if (v >= 10_000) return (v / 10_000).toFixed(0) + '万';
              return v;
            },
          },
        },
      },
    },
  });
}

function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.year}</td>
      <td>${fmt(r.principal)}</td>
      <td>${fmt(r.profit)}</td>
      <td>${fmt(r.total)}</td>
    </tr>
  `).join('');
}

// Run on load with defaults
document.addEventListener('DOMContentLoaded', calculate);
