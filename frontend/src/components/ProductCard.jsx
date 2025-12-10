import { AlertOctagon, AlertTriangle } from 'lucide-react';
const ProductCard = ({ product, onClick, cartQty = 0 }) => {
  const isLowStock = product.stock <= product.lowStockAlert;
  const isOutOfStock = product.stock === 0;
  const isMaxInCart = cartQty >= product.stock;

  return (
    <div
      onClick={isOutOfStock || isMaxInCart ? undefined : onClick}
      className={`rounded-lg p-4 transition-shadow
        ${(isOutOfStock || isMaxInCart)
          ? 'bg-gray-300 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 opacity-70 cursor-not-allowed'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-gray-600/50'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.sku}</p>
        </div>
        <div className="mt-auto">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            ₱{product.price.toFixed(2)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Stock: <span className={isLowStock ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}>{product.stock}</span>
            </span>
            {isOutOfStock && (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold">
                <AlertOctagon size={16} /> Out of Stock
              </span>
            )}
            {!isOutOfStock && isLowStock && (
              <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-semibold">
                <AlertTriangle size={16} /> Low Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
