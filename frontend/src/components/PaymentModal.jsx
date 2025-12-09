import { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, total, onConfirmPayment }) => {
  const [selectedMethod, setSelectedMethod] = useState('Cash');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmPayment(selectedMethod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Total Amount</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">₱{total.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {['Cash', 'QR Code', 'Card'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMethod === method
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {method === 'Cash' && (
                  <svg
                    className={`w-8 h-8 ${
                      selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {method === 'QR Code' && (
                  <svg
                    className={`w-8 h-8 ${
                      selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                )}
                {method === 'Card' && (
                  <svg
                    className={`w-8 h-8 ${
                      selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
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

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
