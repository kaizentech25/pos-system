/**
 * Analytics utilities for dashboard calculations
 */

export const calculateRevenueTrend = (transactions, days = 7, anchorTime = null, timeRange = null) => {
  const now = anchorTime ? new Date(anchorTime) : new Date();
  const data = [];

  // For 24h range, use hourly bucketing
  if (timeRange === '24h') {
    for (let hour = 0; hour < 24; hour++) {
      const startHour = new Date(now);
      startHour.setHours(startHour.getHours() - (23 - hour), 0, 0, 0);
      
      const endHour = new Date(startHour);
      endHour.setHours(endHour.getHours() + 1);

      const hourTransactions = transactions.filter((t) => {
        const txTime = new Date(t.createdAt);
        return txTime >= startHour && txTime < endHour;
      });

      const revenue = hourTransactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);

      data.push({
        date: startHour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        revenue,
        transactions: hourTransactions.length,
      });
    }
    return data;
  }

  // For daily bucketing (7d, 30d, all)
  const formatLocalDateKey = (d) => {
    const local = new Date(d);
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, '0');
    const day = String(local.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = formatLocalDateKey(date);

    const dayTransactions = transactions.filter((t) => {
      const tKey = formatLocalDateKey(new Date(t.createdAt));
      return tKey === dateKey;
    });

    const revenue = dayTransactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      transactions: dayTransactions.length,
    });
  }
  return data;
};

export const calculateHourlyDistribution = (transactions) => {
  const data = Array(24).fill(0).map((_, hour) => ({ hour, count: 0, revenue: 0 }));
  
  transactions.forEach(t => {
    const hour = new Date(t.createdAt).getHours();
    data[hour].count += 1;
    data[hour].revenue += t.totalAmount || t.total || 0;
  });
  
  return data;
};

export const calculateProductAnalytics = (transactions) => {
  const products = {};
  
  transactions.forEach(t => {
    t.items?.forEach(item => {
      if (!products[item.productName]) {
        products[item.productName] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          transactions: 0,
          sku: item.sku || 'N/A',
        };
      }
      products[item.productName].quantity += item.quantity;
      products[item.productName].revenue += (item.price * item.quantity) || 0;
      products[item.productName].transactions += 1;
    });
  });
  
  return Object.values(products).sort((a, b) => b.revenue - a.revenue);
};

export const calculateCompanyComparison = (transactions, companies) => {
  const comparison = {};
  
  companies.forEach(company => {
    const companyTxns = transactions.filter(t => t.company_name === company);
    const revenue = companyTxns.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);
    
    comparison[company] = {
      name: company,
      revenue,
      transactions: companyTxns.length,
      avgTransaction: companyTxns.length ? revenue / companyTxns.length : 0,
    };
  });
  
  return comparison;
};

export const generateInsights = (transactions, companies, products, timeRange) => {
  const insights = [];

  // Top company by revenue
  const companyStats = calculateCompanyComparison(transactions, companies);
  const topCompany = Object.values(companyStats).sort((a, b) => b.revenue - a.revenue)[0];
  if (topCompany) {
    insights.push(`💼 ${topCompany.name} had the highest revenue of ₱${topCompany.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })} in the last ${spellOutTimeRange(timeRange)}.`);
  }

  // Top product
  const topProduct = calculateProductAnalytics(transactions)[0];
  if (topProduct) {
    insights.push(`⭐ The best-selling product was ${topProduct.name} with ${topProduct.quantity.toLocaleString()} units sold.`);
  }

  // Peak hour
  const hourly = calculateHourlyDistribution(transactions);
  const peakHour = hourly.reduce((max, h) => h.count > max.count ? h : max, hourly[0]);
  if (peakHour.count > 0) {
    const hour12 = formatHourAMPM(peakHour.hour);
    insights.push(`⏰ The busiest hour was ${hour12} with ${peakHour.count.toLocaleString()} transactions.`);
  }

  // Average transaction
  const avgTxn = transactions.length ? transactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0) / transactions.length : 0;
  insights.push(`💰 The average transaction value was ₱${avgTxn.toLocaleString('en-PH', { maximumFractionDigits: 2 })}.`);

  return insights;

// Helper to spell out time range
function spellOutTimeRange(range) {
  switch (range) {
    case '24h': return '24 hours';
    case '7d': return '7 days';
    case '30d': return '30 days';
    case 'all': return 'all time';
    default: return range;
  }
}

// Helper to format hour in AM/PM
function formatHourAMPM(hour) {
  const h = parseInt(hour, 10);
  if (isNaN(h)) return hour;
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${ampm}`;
}
};

export const calculateGrowth = (current, previous) => {
  // If previous is zero or not a finite number, comparison is undefined
  if (!isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const getGrowthColor = (growth) => {
  if (growth > 10) return 'text-green-600 dark:text-green-400';
  if (growth > 0) return 'text-blue-600 dark:text-blue-400';
  return 'text-red-600 dark:text-red-400';
};

export const formatMetric = (value, type = 'number') => {
  if (type === 'currency') {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (type === 'percent') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
};
