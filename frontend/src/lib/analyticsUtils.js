/**
 * Analytics utilities for dashboard calculations
 */

export const calculateRevenueTrend = (transactions, days = 7) => {
  const now = new Date();
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTransactions = transactions.filter(
      t => new Date(t.createdAt).toISOString().split('T')[0] === dateStr
    );
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
    insights.push(`💼 ${topCompany.name} leads with ₱${topCompany.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })} in ${timeRange}`);
  }
  
  // Top product
  const topProduct = calculateProductAnalytics(transactions)[0];
  if (topProduct) {
    insights.push(`⭐ Best seller: ${topProduct.name} with ${topProduct.quantity} units sold`);
  }
  
  // Peak hour
  const hourly = calculateHourlyDistribution(transactions);
  const peakHour = hourly.reduce((max, h) => h.count > max.count ? h : max, hourly[0]);
  if (peakHour.count > 0) {
    insights.push(`⏰ Peak hour: ${peakHour.hour}:00 with ${peakHour.count} transactions`);
  }
  
  // Average transaction
  const avgTxn = transactions.length ? transactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0) / transactions.length : 0;
  insights.push(`💰 Average transaction: ₱${avgTxn.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`);
  
  return insights;
};

export const calculateGrowth = (current, previous) => {
  if (previous === 0) return 0;
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
