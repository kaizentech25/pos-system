import express from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getDashboardStats,
  getReports,
} from '../controllers/transactionController.js';

const router = express.Router();

router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);
router.get('/:id', getTransactionById);

export default router;
