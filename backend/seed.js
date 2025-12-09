import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@pos.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Admin user created:', adminUser.email);

    // Create sample products
    const products = [
      {
        name: 'Lucky Me Pancit Canton',
        sku: 'FOOD-001',
        barcode: '1234567890125',
        category: 'Food',
        price: 15.00,
        cost: 10.00,
        stock: 200,
        lowStockAlert: 20,
      },
      {
        name: 'Chippy Barbecue 110g',
        sku: 'SNACK-002',
        barcode: '1234567890128',
        category: 'Snacks',
        price: 25.00,
        cost: 16.00,
        stock: 120,
        lowStockAlert: 15,
      },
      {
        name: 'C2 Green Tea 500ml',
        sku: 'BEV-004',
        barcode: '1234567890129',
        category: 'Beverages',
        price: 30.00,
        cost: 20.00,
        stock: 90,
        lowStockAlert: 15,
      },
      {
        name: 'Nescafe 3in1 Original',
        sku: 'BEV-006',
        barcode: '1234567890132',
        category: 'Beverages',
        price: 8.00,
        cost: 5.00,
        stock: 300,
        lowStockAlert: 50,
      },
      {
        name: 'Coca Cola 330ml',
        sku: 'BEV-001',
        barcode: '1234567890123',
        category: 'Beverages',
        price: 45.00,
        cost: 30.00,
        stock: 93,
        lowStockAlert: 20,
      },
      {
        name: 'Piattos Cheese 85g',
        sku: 'SNACK-001',
        barcode: '1234567890127',
        category: 'Snacks',
        price: 35.00,
        cost: 22.00,
        stock: 149,
        lowStockAlert: 20,
      },
      {
        name: 'Kopiko Black Coffee',
        sku: 'BEV-005',
        barcode: '1234567890130',
        category: 'Beverages',
        price: 25.00,
        cost: 18.00,
        stock: 199,
        lowStockAlert: 30,
      },
      {
        name: 'Skyflakes Crackers',
        sku: 'SNACK-003',
        barcode: '1234567890131',
        category: 'Snacks',
        price: 40.00,
        cost: 28.00,
        stock: 60,
        lowStockAlert: 25,
      },
    ];

    await Product.insertMany(products);
    console.log('Sample products created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('Email: admin@pos.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
