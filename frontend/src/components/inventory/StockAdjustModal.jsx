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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {adjustType === 'in'
                ? `Add Stock to ${product.name}`
                : `Remove Stock from ${product.name}`}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current: {product.stock} units</p>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {!showHistory ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setAdjustType('in')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  adjustType === 'in'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Plus size={18} />
                Stock In
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('out')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  adjustType === 'out'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Minus size={18} />
                Stock Out
              </button>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Quantity *
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                placeholder={adjustType === 'in' ? 'Enter quantity to add' : 'Enter quantity to remove'}
                required
                disabled={adjustType === 'out' && product.stock === 0}
              />
              {/* Error message below input */}
              {adjustType === 'out' && Number(quantity) > product.stock && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-2">Cannot stock out more than current stock ({product.stock}).</div>
              )}
              {adjustType === 'out' && product.stock === 0 && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-2">No stock available to stock out.</div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors resize-none"
                placeholder="Reason for adjustment..."
                rows="2"
              />
            </div>

            {/* Preview */}
            {quantity && isValidQuantity() && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">New Stock Level:</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg text-gray-700 dark:text-gray-300">{product.stock}</span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">→</span>
                  <span className={`text-lg font-bold ${
                    getNewStock() <= product.lowStockAlert ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {getNewStock()}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={loadHistory}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
              >
                <Clock size={16} />
                View History
              </button>
              <div className="flex-1"></div>
              <button 
                type="button" 
                onClick={handleClose} 
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                  adjustType === 'in'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading || !isValidQuantity()}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : adjustType === 'in' ? (
                  <><TrendingUp size={16} /> Stock In</>
                ) : (
                  <><TrendingDown size={16} /> Stock Out</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Stock History</h4>
              <button 
                onClick={() => setShowHistory(false)} 
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Back to Adjust
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No history available</div>
              ) : (
                history.map((entry, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {entry.type === 'in' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">IN</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">OUT</span>
                        )}
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {entry.previousStock} → {entry.newStock}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({entry.type === 'in' ? '+' : '-'}{entry.quantity})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{formatDate(entry.timestamp)}</div>
                    </div>
                    {entry.note && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{entry.note}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAdjustModal;
