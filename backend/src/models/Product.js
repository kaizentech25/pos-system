import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: false,
      default: 'Unknown',
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      // allow dynamic categories entered by users
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockAlert: {
      type: Number,
      default: 10,
    },
    stockHistory: [
      {
        type: {
          type: String,
          enum: ['in', 'out', 'adjustment'],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        previousStock: {
          type: Number,
          required: true,
        },
        newStock: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          default: '',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
