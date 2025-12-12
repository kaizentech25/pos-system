import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { Package, Plus, Filter, FileSearch } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import InventoryStats from '../components/inventory/InventoryStats';
import ProductTable from '../components/inventory/ProductTable';
import ProductForm from '../components/inventory/ProductForm';
import StockAdjustModal from '../components/inventory/StockAdjustModal';
import SearchBar from '../components/inventory/SearchBar';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [stockStatus, setStockStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ column: 'name', direction: 'asc' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    lowStockAlert: 10,
  });
  // Company filter for admin
  const [companyFilter, setCompanyFilter] = useState(user?.role === 'admin' ? '' : user?.company_name || '');
  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCompanies();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [search, category, stockStatus, companyFilter]);

  // Fetch all companies for admin filter
  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/auth/users');
      let companies = Array.from(new Set(response.data.data.map(u => u.company_name)));
      // Remove admin's own company from the filter
      if (user?.company_name) {
        companies = companies.filter(c => c !== user.company_name);
      }
      setCompanyOptions(companies);
    } catch (err) {
      setCompanyOptions([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = { search };
      // For admin: if 'All Companies' is selected, do NOT filter by company_name
      if (user?.role === 'admin') {
        if (companyFilter) {
          params.company_name = companyFilter;
        }
        // else: no company_name param, fetch all
      } else if (user?.company_name) {
        params.company_name = user.company_name;
      }
      if (category && category !== 'All Categories') {
        params.category = category;
      }
      const response = await axios.get('/products', { params });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  // Filter, sort, and paginate products
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      // Prioritize exact SKU/barcode matches, then partial matches
      const exactMatches = filtered.filter(
        (p) =>
          p.sku.toLowerCase() === searchLower ||
          p.barcode.toLowerCase() === searchLower
      );
      const partialMatches = filtered.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(searchLower)) ||
          (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
          (p.barcode && p.barcode.toLowerCase().includes(searchLower))
      );
      // Remove duplicates (if exact match is also a partial match)
      const uniquePartialMatches = partialMatches.filter(
        (p) =>
          !exactMatches.some((e) => e._id === p._id)
      );
      filtered = [...exactMatches, ...uniquePartialMatches];
    }
    if (category !== 'All Categories') {
      filtered = filtered.filter((p) => p.category === category);
    }
    // Stock Status Filter
    if (stockStatus !== 'All') {
      filtered = filtered.filter((p) => {
        if (stockStatus === 'Out of Stock') return p.stock === 0;
        if (stockStatus === 'Low Stock') return p.stock > 0 && p.stock <= p.lowStockAlert;
        if (stockStatus === 'In Stock') return p.stock > p.lowStockAlert;
        return true;
      });
    }
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.column];
      let bValue = b[sortConfig.column];
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [products, search, category, stockStatus, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage) || 1;
  // For highlighting: pass searchLower to ProductTable
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);
  const searchLower = search.trim().toLowerCase();

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/products', formData);
        toast.success('Product created successfully');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      lowStockAlert: product.lowStockAlert,
    });
    setShowProductModal(true);
  };

  const [stockAdjustType, setStockAdjustType] = useState('in');
  const handleStockAdjust = (product, type = 'in') => {
    setSelectedProduct(product);
    setStockAdjustType(type);
    setShowStockModal(true);
  };

  const handleStockSuccess = () => {
    fetchProducts();
    toast.success('Stock adjusted successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      lowStockAlert: 10,
    });
  };

  const openAddProductModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowProductModal(true);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="container max-w-full mx-auto px-4 py-6">
        {/* Stats Cards */}
        <InventoryStats products={products} />

        {/* Main Content Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={val => { setSearch(val); setCurrentPage(1); }}
                  placeholder="Search by name, SKU, or barcode..."
                />
              </div>

              {/* Company Filter for Admin */}
              {user?.role === 'admin' && (
                <div className="relative w-full md:w-48">
                  <select
                    value={companyFilter}
                    onChange={e => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
                    className="select select-bordered w-full pl-10"
                  >
                    <option value="">All Companies</option>
                    {companyOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* Category Filter */}
              <div className="relative w-full md:w-48">
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                  className="select select-bordered w-full pl-10"
                >
                  <option>All Categories</option>
                  <option>Beverages</option>
                  <option>Snacks</option>
                  <option>Food</option>
                  <option>Other</option>
                </select>
                <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Stock Status Filter */}
              <div className="relative w-full md:w-48">
                <select
                  value={stockStatus}
                  onChange={(e) => { setStockStatus(e.target.value); setCurrentPage(1); }}
                  className="select select-bordered w-full pl-10"
                >
                  <option value="All">All Stock Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Add Product Button */}
              <button onClick={openAddProductModal} className="btn btn-primary gap-2">
                <Plus size={20} />
                Add Product
              </button>
            </div>


            {/* Product Table with Pagination and Fixed Height for 10 rows */}
            <div className="overflow-hidden" style={{ height: '600px' }}>
              {paginatedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-base-content/60">
                  <FileSearch size={48} className="mb-2" />
                  <div className="text-lg font-semibold">No matching products</div>
                  <div className="text-sm">Try a different search or filter.</div>
                </div>
              ) : (
                <ProductTable
                  products={paginatedProducts}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStockAdjust={handleStockAdjust}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  searchTerm={searchLower}
                />
              )}
            </div>
            {/* Pagination Controls & Results Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-2">
              <div className="text-sm text-base-content/70">
                {filteredAndSortedProducts.length === 0 ? (
                  <>No products found</>
                ) : (
                  <>Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span>
                  <span className="mx-1">–</span>
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</span>
                  <span className="mx-1">of</span>
                  <span className="font-semibold">{filteredAndSortedProducts.length}</span> products</>
                )}
              </div>
              <div className="flex justify-end items-center gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductForm
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingProduct}
      />

      <StockAdjustModal
        isOpen={showStockModal}
        onClose={() => {
          setShowStockModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={handleStockSuccess}
        initialType={stockAdjustType}
      />
    </div>
  );
};

export default ProductsPage;
