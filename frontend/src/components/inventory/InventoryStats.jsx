import { Package, DollarSign, AlertTriangle, BarChart3, OctagonAlert } from 'lucide-react';

const InventoryStats = ({ products }) => {
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + (p.cost * p.stock), 0),
    lowStockItems: products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length,
    outOfStockItems: products.filter(p => p.stock === 0).length,
  };

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Stock Units',
      value: stats.totalStock.toLocaleString(),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Stock Value',
      value: `₱${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Stock Alerts',
      type: 'dual',
      items: [
        { label: 'Low Stock', value: stats.lowStockItems, icon: AlertTriangle, color: 'text-orange-600' },
        { label: 'Out of Stock', value: stats.outOfStockItems, icon: OctagonAlert, color: 'text-red-600' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        if (stat.type === 'dual') {
          return (
            <div key={index} className="grid grid-cols-2 gap-4">
              {stat.items.map((item, itemIndex) => (
                <div key={itemIndex} className="stats shadow bg-base-100">
                  <div className="stat">
                    <div className={`stat-figure ${item.color}`}>
                      <item.icon size={32} />
                    </div>
                    <div className="stat-title text-base-content/70">{item.label}</div>
                    <div className="stat-value text-2xl lg:text-3xl">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={index} className="stats shadow bg-base-100">
            <div className="stat">
              <div className={`stat-figure ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div className="stat-title text-base-content/70">{stat.label}</div>
              <div className="stat-value text-2xl lg:text-3xl">{stat.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryStats;
