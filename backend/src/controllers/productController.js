import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, company_name } = req.query;
    let query = {};

    if (category && category !== 'All Categories') {
      query.category = category;
    }

    if (company_name) {
      query.company_name = company_name;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, sku, barcode, category, price, cost, stock, lowStockAlert } = req.body;

    if (!name || !sku || !barcode || !category || price === undefined || cost === undefined) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const existingProduct = await Product.findOne({ $or: [{ sku }, { barcode }] });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product with this SKU or barcode already exists' });
    }

    const product = new Product({
      name,
      sku,
      barcode,
      category,
      price,
      cost,
      stock: stock || 0,
      lowStockAlert: lowStockAlert || 10,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const { company_name } = req.query;
    const query = { $expr: { $lte: ['$stock', '$lowStockAlert'] } };
    
    if (company_name) {
      query.company_name = company_name;
    }

    const products = await Product.find(query);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching low stock products:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
