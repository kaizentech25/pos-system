import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
