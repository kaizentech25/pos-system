import { Edit, Trash2, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';

const highlight = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  const idx = text.toLowerCase().indexOf(searchTerm);
  if (idx === -1) return text;
  return <>
    {text.slice(0, idx)}
    <span className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-white font-semibold">{text.slice(idx, idx + searchTerm.length)}</span>
    {text.slice(idx + searchTerm.length)}
  </>;
};

const ProductTable = ({ products, onEdit, onDelete, onStockAdjust, sortConfig, onSort, searchTerm }) => {
  const getSortIcon = (column) => {
    if (sortConfig.column !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const getStockBadge = (product) => {
    if (product.stock === 0) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">Out of Stock</span>;
    }
    if (product.stock <= product.lowStockAlert) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">Low Stock</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">In Stock</span>;
  };

  const getMargin = (product) => {
    if (product.price === 0) return 0;
    return ((product.price - product.cost) / product.price * 100).toFixed(1);
  };

  const getStockValue = (product) => {
    return (product.cost * product.stock).toFixed(2);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th
              onClick={() => onSort('name')}
              className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-1">
                Product {getSortIcon('name')}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-300">SKU / Barcode</th>
            <th
              onClick={() => onSort('price')}
              className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-end gap-1">
                Price {getSortIcon('price')}
              </div>
            </th>
            <th
              onClick={() => onSort('stock')}
              className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-end gap-1">
                Stock {getSortIcon('stock')}
              </div>
            </th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-300">Stock Value</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-300">Margin</th>
            <th
              onClick={() => onSort('category')}
              className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-1">
                Category {getSortIcon('category')}
              </div>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-8 text-gray-500 dark:text-gray-500">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900 dark:text-white">{highlight(product.name, searchTerm)}</div>
                  <div className="mt-2">{getStockBadge(product)}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono text-xs text-gray-600 dark:text-gray-400">{highlight(product.sku, searchTerm)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-600">{highlight(product.barcode, searchTerm)}</div>
                </td>
                <td className="text-right py-3 px-4">
                  <div className="font-semibold text-gray-900 dark:text-white">₱{product.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Cost: ₱{product.cost.toFixed(2)}</div>
                </td>
                <td className="text-right py-3 px-4">
                  <div className={`font-bold ${
                    product.stock === 0 ? 'text-red-600 dark:text-red-400' : 
                    product.stock <= product.lowStockAlert ? 'text-orange-600 dark:text-orange-400' : 
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {product.stock}
                  </div>
                </td>
                <td className="text-right py-3 px-4 font-mono text-sm text-gray-900 dark:text-white">₱{getStockValue(product)}</td>
                <td className="text-right py-3 px-4">
                  <div className={`font-semibold ${
                    getMargin(product) > 30 ? 'text-green-600 dark:text-green-400' :
                    getMargin(product) > 15 ? 'text-blue-600 dark:text-blue-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`}>
                    {getMargin(product)}%
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onStockAdjust(product, 'in')}
                      title="Stock In"
                      className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <TrendingUp size={16} />
                    </button>
                    <button
                      onClick={() => onStockAdjust(product, 'out')}
                      title="Stock Out"
                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={product.stock === 0}
                    >
                      <TrendingDown size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      title="Edit"
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
