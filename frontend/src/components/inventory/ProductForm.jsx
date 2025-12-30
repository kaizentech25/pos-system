import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing, categories: categoriesProp = [] }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const categories = useMemo(() => {
    const unique = new Set(categoriesProp.filter(Boolean));
    if (formData.category) {
      unique.add(formData.category);
    }
    return Array.from(unique);
  }, [categoriesProp, formData.category]);

  useEffect(() => {
    if (isOpen) {
      // Reset custom category UI each time the modal opens so edit mode shows the saved category
      setCustomMode(false);
      setCustomCategory('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const selectValue = customMode ? '__custom__' : (formData.category || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Barcode *
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Category *
              </label>
              <select
                value={selectValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__custom__') {
                    setCustomMode(true);
                    setFormData({ ...formData, category: customCategory || '' });
                  } else {
                    setCustomMode(false);
                    setFormData({ ...formData, category: value });
                    setCustomCategory('');
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__custom__">Custom category…</option>
              </select>
              {customMode && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Enter custom category</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      setFormData({ ...formData, category: e.target.value });
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                    placeholder="e.g., Personal Care"
                    required
                  />
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Selling Price (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Cost Price (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                required
              />
            </div>

            {/* Low Stock Alert */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.lowStockAlert}
                onChange={(e) => setFormData({ ...formData, lowStockAlert: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* Margin Indicator */}
          {formData.price > 0 && formData.cost > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <div className="text-gray-900 dark:text-white">
                <span className="font-semibold">Margin: </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {((formData.price - formData.cost) / formData.price * 100).toFixed(2)}%
                </span>
                <span className="ml-4 text-gray-600 dark:text-gray-400">
                  (Profit: ₱{(formData.price - formData.cost).toFixed(2)} per unit)
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              {isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
