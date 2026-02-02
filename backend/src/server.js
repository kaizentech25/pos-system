import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { connectDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const allowedOrigins = [
  'https://kaizentech-pos-system.vercel.app/', // your Vercel frontend
  // add other domains if needed
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies/auth
}));
app.use(express.json());
app.use(rateLimiter);

// Custom middleware to log request method and URL
// app.use((req, res, next) => {
//   console.log(`Request method is ${req.method} & Req URL is ${req.url}`);
//   next();
// });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "connected",
    services: {
      api: "operational",
      auth: "operational",
      products: "operational",
      transactions: "operational"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});