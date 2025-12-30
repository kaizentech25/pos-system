import { X, Printer } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-4 bg-white dark:bg-gray-900">
          {/* Company Header */}
          <div className="text-center mb-4 border-b border-gray-300 dark:border-gray-600 pb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{receipt.company_name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Point of Sale System</p>
          </div>

          {/* Transaction Info */}
          <div className="mb-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
              <span className="font-mono text-gray-900 dark:text-white">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="text-gray-900 dark:text-white">{new Date(receipt.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Time:</span>
              <span className="text-gray-900 dark:text-white">{new Date(receipt.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cashier:</span>
              <span className="text-gray-900 dark:text-white">{receipt.cashierName}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-b border-gray-300 dark:border-gray-600 py-3 mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 dark:text-gray-400">
                  <th className="text-left pb-2">Item</th>
                  <th className="text-center pb-2">Qty</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 dark:text-white">
                {receipt.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.productSku}</div>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">₱{item.price.toFixed(2)}</td>
                    <td className="text-right font-medium">₱{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-white">₱{receipt.subtotal.toFixed(2)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount:</span>
                <span>-₱{receipt.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">VAT (12%):</span>
              <span className="text-gray-900 dark:text-white">₱{receipt.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className="font-bold text-gray-900 dark:text-white">TOTAL:</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">₱{receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-gray-300 dark:border-gray-600 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
              <span className="font-medium text-gray-900 dark:text-white">{receipt.paymentMethod}</span>
            </div>
            {receipt.paymentMethod === 'Cash' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cash Received:</span>
                  <span className="text-gray-900 dark:text-white">₱{receipt.cashReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Change:</span>
                  <span className="font-medium text-gray-900 dark:text-white">₱{receipt.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">Thank you for your purchase!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please keep this receipt for your records</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            border: none;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
