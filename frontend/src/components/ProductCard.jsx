const ProductCard = ({ product, onClick }) => {
  const isLowStock = product.stock <= product.lowStockAlert;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
        </div>
        <div className="mt-auto">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            ₱{product.price.toFixed(2)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Stock: <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>{product.stock}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
