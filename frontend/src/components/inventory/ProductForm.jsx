import { X } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Product Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* SKU */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">SKU *</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Barcode */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Barcode *</span>
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Category */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Category *</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Category</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Selling Price (₱) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Cost */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Cost Price (₱) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Stock */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Stock Quantity *</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Low Stock Alert */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Low Stock Alert Threshold</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.lowStockAlert}
                onChange={(e) => setFormData({ ...formData, lowStockAlert: Number(e.target.value) })}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Margin Indicator */}
          {formData.price > 0 && formData.cost > 0 && (
            <div className="alert alert-info">
              <div>
                <span className="font-semibold">Margin: </span>
                {((formData.price - formData.cost) / formData.price * 100).toFixed(2)}%
                <span className="ml-4 text-sm opacity-75">
                  (Profit: ₱{(formData.price - formData.cost).toFixed(2)} per unit)
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ProductForm;
