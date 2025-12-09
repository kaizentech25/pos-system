import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, subtotal, discount, vat, total, paymentMethod, cashier, cashierName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Transaction must have at least one item' });
    }

    // Update stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, message: `Product ${item.productName} not found` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      product.stock -= item.quantity;
      await product.save({ session });
    }

    const transaction = new Transaction({
      items,
      subtotal,
      discount: discount || 0,
      vat,
      total,
      paymentMethod,
      cashier,
      cashierName,
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    session.endSession();
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('items.product')
      .populate('cashier')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate('items.product')
      .populate('cashier');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.find({
      createdAt: { $gte: today },
    });

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const transactionCount = todayTransactions.length;

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockAlert'] },
    });

    const activeProducts = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        todaySales,
        transactions: transactionCount,
        lowStockItems: lowStockProducts.length,
        activeProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getReports = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    const transactions = await Transaction.find({
      createdAt: { $gte: startDate },
    }).populate('items.product');

    // Calculate total sales
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);

    // Calculate average transaction
    const avgTransaction = transactions.length > 0 ? totalSales / transactions.length : 0;

    // Top category
    const categoryRevenue = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        const category = item.product?.category || 'Other';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.subtotal;
      });
    });

    const topCategory = Object.keys(categoryRevenue).reduce((a, b) => 
      categoryRevenue[a] > categoryRevenue[b] ? a : b, 'Beverages'
    );

    // Payment methods breakdown
    const paymentMethods = {};
    transactions.forEach(t => {
      const method = t.paymentMethod;
      if (!paymentMethods[method]) {
        paymentMethods[method] = { amount: 0, count: 0 };
      }
      paymentMethods[method].amount += t.total;
      paymentMethods[method].count += 1;
    });

    // Top products by revenue
    const productRevenue = {};
    const productQuantity = {};
    
    transactions.forEach(t => {
      t.items.forEach(item => {
        const productId = item.product?._id.toString();
        const productName = item.product?.name || item.productName;
        
        if (productId) {
          if (!productRevenue[productId]) {
            productRevenue[productId] = { name: productName, revenue: 0 };
            productQuantity[productId] = 0;
          }
          productRevenue[productId].revenue += item.subtotal;
          productQuantity[productId] += item.quantity;
        }
      });
    });

    const topProducts = Object.keys(productRevenue)
      .map(id => ({
        name: productRevenue[id].name,
        revenue: productRevenue[id].revenue,
        quantity: productQuantity[id],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Daily sales for chart
    const dailySales = {};
    transactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + t.total;
    });

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        transactions: transactions.length,
        avgTransaction,
        topCategory,
        paymentMethods,
        topProducts,
        dailySales,
      },
    });
  } catch (error) {
    console.error('Error generating reports:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
