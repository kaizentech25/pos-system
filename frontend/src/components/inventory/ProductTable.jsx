import { Edit, Trash2, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';

const highlight = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  const idx = text.toLowerCase().indexOf(searchTerm);
  if (idx === -1) return text;
  return <>
    {text.slice(0, idx)}
    <span className="bg-yellow-200 text-yellow-900">{text.slice(idx, idx + searchTerm.length)}</span>
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
      return <div className="badge badge-error badge-sm">Out of Stock</div>;
    }
    if (product.stock <= product.lowStockAlert) {
      return <div className="badge badge-warning badge-sm">Low Stock</div>;
    }
    return <div className="badge badge-success badge-sm">In Stock</div>;
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
      <table className="table table-zebra">
        <thead>
          <tr>
            <th
              onClick={() => onSort('name')}
              className="cursor-pointer hover:bg-base-200"
            >
              <div className="flex items-center gap-1">
                Product {getSortIcon('name')}
              </div>
            </th>
            <th>SKU / Barcode</th>
            <th
              onClick={() => onSort('price')}
              className="cursor-pointer hover:bg-base-200"
            >
              <div className="flex items-center gap-1">
                Price {getSortIcon('price')}
              </div>
            </th>
            <th
              onClick={() => onSort('stock')}
              className="cursor-pointer hover:bg-base-200"
            >
              <div className="flex items-center gap-1">
                Stock {getSortIcon('stock')}
              </div>
            </th>
            <th>Stock Value</th>
            <th>Margin</th>
            <th
              onClick={() => onSort('category')}
              className="cursor-pointer hover:bg-base-200"
            >
              <div className="flex items-center gap-1">
                Category {getSortIcon('category')}
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-8 text-base-content/50">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product._id} className="hover">
                <td>
                  <div className="font-semibold">{highlight(product.name, searchTerm)}</div>
                  <div className="mt-1">{getStockBadge(product)}</div>
                </td>
                <td>
                  <div className="font-mono text-sm">{highlight(product.sku, searchTerm)}</div>
                  <div className="text-xs opacity-70">{highlight(product.barcode, searchTerm)}</div>
                </td>
                <td>
                  <div className="font-semibold">₱{product.price.toFixed(2)}</div>
                  <div className="text-xs opacity-70">Cost: ₱{product.cost.toFixed(2)}</div>
                </td>
                <td>
                  <div className={`font-bold ${
                    product.stock === 0 ? 'text-error' : 
                    product.stock <= product.lowStockAlert ? 'text-warning' : 
                    'text-success'
                  }`}>
                    {product.stock}
                  </div>
                </td>
                <td>
                  <div className="font-mono text-sm">₱{getStockValue(product)}</div>
                </td>
                <td>
                  <div className={`font-semibold ${
                    getMargin(product) > 30 ? 'text-success' :
                    getMargin(product) > 15 ? 'text-info' :
                    'text-warning'
                  }`}>
                    {getMargin(product)}%
                  </div>
                </td>
                <td>
                  <div className="badge badge-outline badge-sm">{product.category}</div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <div className="tooltip" data-tip="Stock In">
                      <button
                        onClick={() => onStockAdjust(product, 'in')}
                        className="btn btn-xs btn-success btn-outline"
                      >
                        <TrendingUp size={14} />
                      </button>
                    </div>
                    <div className="tooltip" data-tip="Stock Out">
                        <button
                          onClick={() => onStockAdjust(product, 'out')}
                          className="btn btn-xs mr-2 btn-error btn-outline"
                          disabled={product.stock === 0}
                        >
                          <TrendingDown size={14} />
                        </button>
                    </div>
                    <div className="tooltip" data-tip="Edit">
                      <button
                        onClick={() => onEdit(product)}
                        className="btn btn-xs btn-ghost p-1"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                    <div className="tooltip" data-tip="Delete">
                      <button
                        onClick={() => onDelete(product._id)}
                        className="btn btn-xs btn-ghost p-1 text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
