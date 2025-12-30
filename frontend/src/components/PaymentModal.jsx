import { useState, useEffect } from 'react';
import { X, Banknote, QrCode, CreditCard } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, total, onConfirmPayment, loading }) => {
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (selectedMethod === 'Cash' && cashReceived) {
      const received = parseFloat(cashReceived) || 0;
      setChange(Math.max(0, received - total));
    } else {
      setChange(0);
    }
  }, [cashReceived, total, selectedMethod]);

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('Cash');
      setCashReceived('');
      setChange(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const paymentData = {
      method: selectedMethod,
      cashReceived: selectedMethod === 'Cash' ? parseFloat(cashReceived) : null,
      change: selectedMethod === 'Cash' ? change : null,
    };
    onConfirmPayment(paymentData);
  };

  const isValidPayment = () => {
    if (selectedMethod === 'Cash') {
      const received = parseFloat(cashReceived) || 0;
      return received >= total;
    }
    return true; // QR and Card are always valid once selected
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Total Amount Due */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount Due</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₱{total.toFixed(2)}</p>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['Cash', 'QR Code', 'Card'].map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                disabled={loading}
                className={`p-6 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  selectedMethod === method
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {method === 'Cash' && (
                    <Banknote
                      className={`w-8 h-8 ${selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                    />
                  )}
                  {method === 'QR Code' && (
                    <QrCode
                      className={`w-8 h-8 ${selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                    />
                  )}
                  {method === 'Card' && (
                    <CreditCard
                      className={`w-8 h-8 ${selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                    />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {method}
                  </span>
                  {method === 'QR Code' && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">(GCash/Maya)</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Payment Input */}
        {selectedMethod === 'Cash' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cash Received
              </label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Enter amount received"
                disabled={loading}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50"
              />
            </div>
            {cashReceived && (
              <div className={`p-4 rounded-lg ${change >= 0 && parseFloat(cashReceived) >= total ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                <p className={`text-sm mb-1 ${change >= 0 && parseFloat(cashReceived) >= total ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {parseFloat(cashReceived) >= total ? 'Change' : 'Insufficient Amount'}
                </p>
                <p className={`text-2xl font-bold ${change >= 0 && parseFloat(cashReceived) >= total ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {parseFloat(cashReceived) >= total ? `₱${change.toFixed(2)}` : `₱${(total - parseFloat(cashReceived)).toFixed(2)} short`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValidPayment() || loading}
            className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
