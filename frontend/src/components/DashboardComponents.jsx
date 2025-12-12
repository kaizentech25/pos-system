import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({ label, value, change, icon: Icon, color = 'blue' }) => {
  const isPositive = change >= 0;
  const colorMap = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${colorMap[color]}`} />}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">vs last week</span>
        </div>
      )}
    </div>
  );
};

export const ChartCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {title}
      </h3>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export const InsightCard = ({ insights }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendRow = ({ label, value, trend, unit = '' }) => {
  const isPositive = trend >= 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900 dark:text-white">{value}{unit}</span>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export const SimpleChart = ({ data, type = 'bar' }) => {
  if (type === 'bar') {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.displayValue || item.value}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return null;
};

export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};
