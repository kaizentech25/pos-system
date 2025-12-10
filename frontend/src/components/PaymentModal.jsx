import { useState } from 'react';
import { X, Banknote, QrCode, CreditCard } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white"> Select Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
            aria-label="Close"
          >
            <X size={24} />
          </button>
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
