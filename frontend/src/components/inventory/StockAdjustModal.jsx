import { useState } from 'react';
import { X, Plus, Minus, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import axios from '../../lib/axios';

const StockAdjustModal = ({ isOpen, onClose, product, onSuccess, initialType = 'in' }) => {
  const [adjustType, setAdjustType] = useState(initialType);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  if (!isOpen || !product) return null;

  // If the modal is opened with a different initialType, update adjustType
  // (This ensures the correct tab is active when opening)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (adjustType !== initialType) setAdjustType(initialType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!isValidQuantity()) return;
    setLoading(true);
    try {
      await axios.post(`/products/${product._id}/adjust-stock`, {
        type: adjustType,
        quantity: qty,
        note,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if the quantity is valid
  const isValidQuantity = () => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return false;
    if (adjustType === 'out' && qty > product.stock) return false;
    return true;
  };

  const handleClose = () => {
    setAdjustType('in');
    setQuantity('');
    setNote('');
    setShowHistory(false);
    setHistory([]);
    onClose();
  };

  const loadHistory = async () => {
    if (history.length > 0) {
      setShowHistory(!showHistory);
      return;
    }

    try {
      const response = await axios.get(`/products/${product._id}/stock-history`);
      setHistory(response.data.data.history || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getNewStock = () => {
    const qty = Number(quantity) || 0;
    if (adjustType === 'in') return product.stock + qty;
    if (adjustType === 'out') return product.stock - qty;
    return product.stock;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-xl">
              {adjustType === 'in'
                ? `Add Stock to ${product.name}`
                : `Remove Stock from ${product.name}`}
            </h3>
            <p className="text-sm opacity-70">Current: {product.stock} units</p>
          </div>
          <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {!showHistory ? (
          <form onSubmit={handleSubmit} className="space-y-4">


            {/* Quantity */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Quantity *</span>
              </label>
              <input
                type="number"
                min="1"
                max={adjustType === 'out' ? product.stock : undefined}
                value={quantity}
                onChange={e => {
                  let val = e.target.value;
                  // Allow any value, but prevent negative or zero
                  if (Number(val) < 1) val = '';
                  setQuantity(val);
                }}
                className="input input-bordered w-full"
                placeholder={adjustType === 'in' ? 'Enter quantity to add' : 'Enter quantity to remove'}
                required
                disabled={adjustType === 'out' && product.stock === 0}
              />
              {/* Error message below input */}
              {adjustType === 'out' && Number(quantity) > product.stock && (
                <div className="text-error text-xs mt-1">Cannot stock out more than current stock ({product.stock}).</div>
              )}
              {adjustType === 'out' && product.stock === 0 && (
                <div className="text-error text-xs mt-1">No stock available to stock out.</div>
              )}
            </div>

            {/* Note */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Note (Optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="textarea textarea-bordered"
                placeholder="Reason for adjustment..."
                rows="2"
              />
            </div>

            {/* Preview */}
            {quantity && isValidQuantity() && (
              <div className="alert">
                <div className="flex-1">
                  <div className="text-sm font-semibold">New Stock Level:</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{product.stock}</span>
                    <span className="text-lg">→</span>
                    <span className={`text-lg font-bold ${
                      getNewStock() <= product.lowStockAlert ? 'text-error' : 'text-success'
                    }`}>
                      {getNewStock()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadHistory}
                className="btn btn-ghost btn-sm"
              >
                <Clock size={16} />
                View History
              </button>
              <div className="flex-1"></div>
              <button type="button" onClick={handleClose} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${adjustType === 'in' ? 'btn-success' : 'btn-error'}`}
                disabled={loading || !isValidQuantity()}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : adjustType === 'in' ? (
                  <><TrendingUp size={16} className="inline mr-1" /> Stock In</>
                ) : (
                  <><TrendingDown size={16} className="inline mr-1" /> Stock Out</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Stock History</h4>
              <button onClick={() => setShowHistory(false)} className="btn btn-sm btn-ghost">
                Back to Adjust
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">No history available</div>
              ) : (
                history.map((entry, index) => (
                  <div key={index} className="card bg-base-200 shadow-sm">
                    <div className="card-body p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {entry.type === 'in' ? (
                            <div className="badge badge-success badge-sm">IN</div>
                          ) : (
                            <div className="badge badge-error badge-sm">OUT</div>
                          )}
                          <span className="font-mono text-sm">
                            {entry.previousStock} → {entry.newStock}
                          </span>
                          <span className="text-sm opacity-70">
                            ({entry.type === 'in' ? '+' : '-'}{entry.quantity})
                          </span>
                        </div>
                        <div className="text-xs opacity-50">{formatDate(entry.timestamp)}</div>
                      </div>
                      {entry.note && (
                        <div className="text-sm opacity-70 mt-1">{entry.note}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default StockAdjustModal;
