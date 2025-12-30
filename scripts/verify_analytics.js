// Verify analytics calculations against backend data
// Run: node scripts/verify_analytics.js

const http = require('http');
const BASE_URL = 'http://localhost:5001/api';

const fetchJSON = (path) => new Promise((resolve, reject) => {
  const url = `${BASE_URL}${path}`;
  http.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (e) {
        reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
      }
    });
  }).on('error', (err) => reject(err));
});

const peso = (n) => `₱${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ranges = [
  { key: '24h', label: 'Last 24 Hours', days: 1 },
  { key: '7d', label: 'Last 7 Days', days: 7 },
  { key: '30d', label: 'Last 30 Days', days: 30 },
  { key: 'all', label: 'All Time', days: null },
];

const startForRange = (key) => {
  const now = new Date();
  switch (key) {
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all': return new Date(0);
    default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
};

const growth = (curr, prev) => {
  if (!isFinite(prev) || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
};

const summarize = (txns) => {
  const revenue = txns.reduce((s, t) => s + (t.totalAmount || t.total || 0), 0);
  const count = txns.length;
  const avg = count ? revenue / count : 0;
  return { revenue, count, avg };
};

(async () => {
  try {
    const [txRes, usersRes] = await Promise.all([
      fetchJSON('/transactions'),
      fetchJSON('/auth/users'),
    ]);
    const transactions = txRes.data || [];
    const users = usersRes.data || [];

    // Market (platform-wide)
    console.log('\n=== Market Analytics Verification ===');
    for (const r of ranges) {
      const rangeStart = startForRange(r.key);
      const currTx = transactions.filter(t => new Date(t.createdAt) >= rangeStart);
      const curr = summarize(currTx);

      let prev = { revenue: 0, count: 0, avg: 0 };
      if (r.key !== 'all') {
        const prevStart = new Date(rangeStart);
        const days = r.days;
        prevStart.setDate(prevStart.getDate() - days);
        const prevTx = transactions.filter(t => {
          const created = new Date(t.createdAt);
          return created >= prevStart && created < rangeStart;
        });
        prev = summarize(prevTx);
      }

      const revGrowth = growth(curr.revenue, prev.revenue);
      const txnGrowth = growth(curr.count, prev.count);
      const avgGrowth = growth(curr.avg, prev.avg);

      console.log(`\n${r.label}`);
      console.log(`Revenue: ${peso(curr.revenue)}${revGrowth == null ? '' : ` (${revGrowth.toFixed(1)}%)`}`);
      console.log(`Transactions: ${curr.count.toLocaleString()}${txnGrowth == null ? '' : ` (${txnGrowth.toFixed(1)}%)`}`);
      console.log(`Avg Txn: ${peso(curr.avg)}${avgGrowth == null ? '' : ` (${avgGrowth.toFixed(1)}%)`}`);
    }

    // Company (example: 7 Eleven Jimenez)
    const company = '7 Eleven Jimenez';
    console.log('\n=== Company Analytics Verification ===');
    for (const r of ranges) {
      const rangeStart = startForRange(r.key);
      const companyTx = transactions.filter(t => t.company_name === company && new Date(t.createdAt) >= rangeStart);
      const curr = summarize(companyTx);

      let prev = { revenue: 0, count: 0, avg: 0 };
      if (r.key !== 'all') {
        const prevStart = new Date(rangeStart);
        const days = r.days;
        prevStart.setDate(prevStart.getDate() - days);
        const prevTx = transactions.filter(t => t.company_name === company && new Date(t.createdAt) >= prevStart && new Date(t.createdAt) < rangeStart);
        prev = summarize(prevTx);
      }

      const revGrowth = growth(curr.revenue, prev.revenue);
      const txnGrowth = growth(curr.count, prev.count);
      const avgGrowth = growth(curr.avg, prev.avg);

      console.log(`\n${company} — ${r.label}`);
      console.log(`Revenue: ${peso(curr.revenue)}${revGrowth == null ? '' : ` (${revGrowth.toFixed(1)}%)`}`);
      console.log(`Transactions: ${curr.count.toLocaleString()}${txnGrowth == null ? '' : ` (${txnGrowth.toFixed(1)}%)`}`);
      console.log(`Avg Txn: ${peso(curr.avg)}${avgGrowth == null ? '' : ` (${avgGrowth.toFixed(1)}%)`}`);
    }

    // Active companies check
    const nonAdminUsers = users.filter(u => u.role !== 'admin');
    const companies = [...new Set(nonAdminUsers.map(u => u.company_name).filter(Boolean))];
    console.log(`\nActive Companies: ${companies.length}`);
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
})();
