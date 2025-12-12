import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const COMPANIES = [
  {
    name: '7 Eleven Jimenez',
    code: '7EJ',
    products: 20,
  },
  {
    name: "Ding's Store",
    code: 'DING',
    products: 14,
  },
  {
    name: "Dezzee's Grocery",
    code: 'DEZZ',
    products: 7,
  },
  {
    name: 'J-Mart',
    code: 'JMRT',
    products: 25,
  },
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildProducts = (company) => {
  // Realistic PH product price ranges (in PHP)
  const categoryRanges = {
    'Beverages': { min: 15, max: 160 },
    'Snacks': { min: 10, max: 150 },
    'Food': { min: 20, max: 220 },
    'Other': { min: 10, max: 500 },
  };
  // Realistic PH product names by category
  const productNames = {
    'Beverages': [
      'Coke 1L', 'C2 Green Tea', 'Milo', 'Nescafe Classic', 'Yakult', 'San Mig Light', 'Bear Brand Powdered Milk', 'Great Taste White', 'Selecta Ice Cream',
    ],
    'Snacks': [
      'SkyFlakes Crackers', 'Piattos Cheese', "Jack n' Jill Chippy", 'Fita Biscuits', 'Oishi Prawn Crackers', 'Nova Multigrain',
    ],
    'Food': [
      'Lucky Me Pancit Canton', 'Purefoods Corned Beef', 'Ligo Sardines', 'Palmolive Shampoo', 'Safeguard Soap',
    ],
    'Other': [
      'Downy Fabric Softener', 'Colgate Toothpaste', 'Johnson Baby Powder', 'Vicks Vaporub', 'Hansel Mocha Biscuits',
    ],
  };
  const categories = Object.keys(categoryRanges);
  const usedNames = new Set();
  const usedSKUs = new Set();
  const products = [];
  for (let i = 1; i <= company.products; i++) {
    const category = randomPick(categories);
    let name;
    let baseName;
    let tries = 0;
    // Try to pick a unique name from the pool
    do {
      baseName = randomPick(productNames[category]);
      name = baseName;
      if (usedNames.has(name)) {
        // If exhausted, append a number to make it unique
        name = `${baseName} ${i}`;
      }
      tries++;
    } while (usedNames.has(name) && tries < 20);
    usedNames.add(name);
    const { min, max } = categoryRanges[category];
    const basePrice = min + Math.floor(Math.random() * (max - min + 1));
    const cost = Number((basePrice * (0.75 + Math.random() * 0.15)).toFixed(2));
    // SKU: COMPANYCODE-CAT-PRODNAME-UNIQ (alphanumeric, max 20 chars)
    let skuBase = `${company.code}-${category.substring(0,2).toUpperCase()}-${baseName.replace(/[^A-Z0-9]/gi,'').substring(0,8).toUpperCase()}`;
    let sku = skuBase;
    let skuTries = 0;
    while (usedSKUs.has(sku) && skuTries < 10) {
      sku = `${skuBase}${i}`;
      skuTries++;
    }
    usedSKUs.add(sku);
    products.push({
      company_name: company.name,
      name,
      sku,
      barcode: `${company.code}-BC-${String(1000 + i)}`,
      category,
      price: Number(basePrice.toFixed(2)),
      cost,
      stock: 50 + Math.floor(Math.random() * 150),
      lowStockAlert: 15,
    });
  }
  return products;
};

const buildUsers = (company) => {
  return [
    {
      name: `${company.code} Store Manager`,
      user_id: `${company.code}-MGR-001`,
      password: 'manager123',
      company_name: company.name,
      role: 'manager',
    },
    {
      name: `${company.code} Inventory Manager`,
      user_id: `${company.code}-INV-001`,
      password: 'inventory123',
      company_name: company.name,
      role: 'inventory_manager',
    },
    {
      name: `${company.code} Cashier 1`,
      user_id: `${company.code}-CSH-001`,
      password: 'cashier123',
      company_name: company.name,
      role: 'cashier',
    },
    {
      name: `${company.code} Cashier 2`,
      user_id: `${company.code}-CSH-002`,
      password: 'cashier123',
      company_name: company.name,
      role: 'cashier',
    },
  ];
};

const createTransactions = (company, products, cashiers) => {
  const transactions = [];
  const now = new Date();
  // 2 weeks worth of transactions, 14 days
  for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
    // Random daily count between 20 and 50
    const count = 20 + Math.floor(Math.random() * 31);
    for (let i = 0; i < count; i++) {
      const itemCount = 1 + Math.floor(Math.random() * Math.min(4, products.length));
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const product = randomPick(products);
        const qty = 1 + Math.floor(Math.random() * 4);
        const subtotal = Number((product.price * qty).toFixed(2));
        items.push({
          product: product._id,
          productName: product.name,
          productSku: product.sku,
          quantity: qty,
          price: product.price,
          subtotal,
        });
      }
      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const discount = 0;
      const vat = Number((subtotal * 0.12).toFixed(2));
      const total = Number((subtotal + vat - discount).toFixed(2));
      const cashier = randomPick(cashiers);
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - (13 - dayIndex));
      createdAt.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);

      transactions.push({
        company_name: company.name,
        items,
        subtotal,
        discount,
        vat,
        total,
        totalAmount: total,
        paymentMethod: randomPick(['Cash', 'QR Code', 'Card']),
        cashier: cashier._id,
        cashierName: cashier.name,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }
  return transactions;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clean collections
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Transaction.deleteMany({}),
    ]);

    // Admin user
    const adminUser = await User.create({
      name: 'Admin Developer',
      user_id: 'ADMIN-00000-000',
      password: 'admin123',
      company_name: 'TechWisePH',
      role: 'admin',
    });
    console.log(`✓ Created admin: ${adminUser.user_id}`);

    const allProducts = [];
    const allTransactions = [];

    for (const company of COMPANIES) {
      // Create users per company - use create() instead of insertMany() to trigger password hashing
      const userDocs = buildUsers(company);
      const companyUsers = [];
      for (const userData of userDocs) {
        const user = await User.create(userData);
        companyUsers.push(user);
      }
      const cashiers = companyUsers.filter((u) => u.role === 'cashier');
      console.log(`✓ ${company.name}: created ${companyUsers.length} users`);

      // Create products per company
      const productDocs = await Product.insertMany(buildProducts(company));
      console.log(`✓ ${company.name}: created ${productDocs.length} products`);
      allProducts.push(...productDocs);

      // Transactions per company
      const companyTransactions = createTransactions(company, productDocs, cashiers);
      allTransactions.push(...companyTransactions);
    }

    // Persist transactions after building all to ensure referenced products/cashiers exist
    await Transaction.insertMany(allTransactions);
    console.log(`✓ Created ${allTransactions.length} transactions across companies`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n=== Demo Credentials ===');
    console.log('Admin (Full Access):');
    console.log('  User ID: ADMIN-00000-000');
    console.log('  Password: admin123');
    console.log('  Company: TechWisePH');
    console.log('\nPer-Company Accounts:');
    COMPANIES.forEach((c) => {
      console.log(`\n${c.name}:`);
      console.log(`  Manager: ${c.code}-MGR-001 / manager123`);
      console.log(`  Inventory: ${c.code}-INV-001 / inventory123`);
      console.log(`  Cashier 1: ${c.code}-CSH-001 / cashier123`);
      console.log(`  Cashier 2: ${c.code}-CSH-002 / cashier123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
