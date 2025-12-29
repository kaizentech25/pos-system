import { Package, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';

const InventoryStats = ({ products }) => {
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + (p.cost * p.stock), 0),
    lowStockItems: products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length,
    outOfStockItems: products.filter(p => p.stock === 0).length,
  };

  const colorStyles = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  const StatCard = ({ label, value, icon: Icon, color }) => {
    return (
      <div className="rounded-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${colorStyles[color]} flex-shrink-0 mt-1 opacity-80`} />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Total Products"
        value={stats.totalProducts}
        icon={Package}
        color="blue"
      />
      <StatCard
        label="Total Stock Units"
        value={stats.totalStock.toLocaleString()}
        icon={BarChart3}
        color="purple"
      />
      <StatCard
        label="Stock Value"
        value={`₱${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        color="green"
      />
      <StatCard
        label="Stock Alerts"
        value={stats.lowStockItems + stats.outOfStockItems}
        icon={AlertTriangle}
        color="orange"
      />
    </div>
  );
};

export default InventoryStats;
