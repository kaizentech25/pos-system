import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MonitorSmartphone, Search, Trash2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from '../lib/axios';

const POSTerminalPage = () => {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products', {
        params: { search },
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const subtotal = getCartTotal();
  const vatAmount = subtotal * 0.12;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + vatAmount - discountAmount;

  const handlePayment = async (paymentMethod) => {
    setLoading(true);
    try {
      const transactionData = {
        items: cart.map((item) => ({
          product: item._id,
          productName: item.name,
          productSku: item.sku,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal,
        discount: discountAmount,
        vat: vatAmount,
        total,
        paymentMethod,
        cashier: user._id,
        cashierName: user.name,
      };

      await axios.post('/transactions', transactionData);
      alert('Transaction completed successfully!');
      clearCart();
      setDiscount(0);
      setShowPaymentModal(false);
      fetchProducts(); // Refresh to update stock
    } catch (error) {
      alert(error.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-full mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6"><MonitorSmartphone size={28} className="inline mr-2" /> POS Terminal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name, SKU, or barcode..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const cartItem = cart.find((item) => item._id === product._id);
                const cartQty = cartItem ? cartItem.quantity : 0;
                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    cartQty={cartQty}
                    onClick={() => addToCart(product)}
                  />
                );
              })}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Sale</h2>

              <div className="mb-6 h-[380px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No items in cart</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Scan or search for products</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                        <div
                          key={item._id}
                          className={`bg-gray-50 dark:bg-gray-700 flex gap-3 p-3 rounded-lg items-center transition-all ${idx === 0 ? 'border border-gray-400 dark:border-gray-400' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className={`w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center ${item.quantity >= (products.find(p => p._id === item._id)?.stock || 0) ? '' : 'hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                              disabled={item.quantity >= (products.find(p => p._id === item._id)?.stock || 0)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-center min-w-[80px]">
                          <p className="font-bold text-gray-900 dark:text-white min-w-[64px]">₱{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">₱{item.price.toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-600 hover:text-red-700 flex items-center justify-center"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount %:</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                    min="0"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₱{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({discount}%):</span>
                      <span>-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">VAT (12%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">₱{vatAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₱{total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        clearCart();
                        setDiscount(0);
                      }}
                      disabled={cart.length === 0}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      disabled={cart.length === 0 || loading}
                      className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Pay (₱{total.toFixed(2)})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        onConfirmPayment={handlePayment}
      />
    </div>
  );
};

export default POSTerminalPage;
