import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  adjustStock,
  getStockHistory,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', getProductById);
router.get('/:id/stock-history', getStockHistory);
router.post('/', createProduct);
router.post('/:id/adjust-stock', adjustStock);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
