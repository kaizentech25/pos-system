import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const COMPANIES = [
  { name: 'Luna Mart', code: 'LNM', products: 22 },
  { name: 'Bayan Mini Stop', code: 'BYN', products: 18 },
  { name: 'Harbor Fresh Grocer', code: 'HFG', products: 24 },
  { name: 'Summit Convenience', code: 'SMT', products: 20 },
  { name: 'Greenfield Market', code: 'GFM', products: 26 },
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildProducts = (company) => {
  // Realistic PH product price ranges (in PHP)
  const categoryRanges = {
    'Beverages': { min: 15, max: 160 },
    'Snacks': { min: 10, max: 150 },
    'Food': { min: 20, max: 220 },
    'Other': { min: 10, max: 500 },
    'Household': { min: 25, max: 350 },
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
    'Household': [
      'Joy Dishwashing Liquid', 'Calla Detergent', 'Mr. Muscle Multi-Surface', 'Domex Toilet Cleaner', 'Pride Powder Detergent',
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

const buildUsers = (company) => ([
  {
    name: `${company.name} Manager`,
    user_id: `${company.code}-MGR-001`,
    password: 'manager123',
    company_name: company.name,
    role: 'manager',
  },
  {
    name: `${company.name} Inventory Manager`,
    user_id: `${company.code}-INV-001`,
    password: 'inventory123',
    company_name: company.name,
    role: 'inventory_manager',
  },
  {
    name: `${company.name} Cashier 1`,
    user_id: `${company.code}-CSH-001`,
    password: 'cashier123',
    company_name: company.name,
    role: 'cashier',
  },
  {
    name: `${company.name} Cashier 2`,
    user_id: `${company.code}-CSH-002`,
    password: 'cashier123',
    company_name: company.name,
    role: 'cashier',
  },
]);

const createTransactions = (company, products, cashiers) => {
  const transactions = [];
  const now = new Date();
  const days = 60; // last 60 days for richer reporting

  const weightedPick = (options) => {
    const total = options.reduce((sum, o) => sum + o.weight, 0);
    let roll = Math.random() * total;
    for (const option of options) {
      if ((roll -= option.weight) <= 0) return option.value;
    }
    return options[options.length - 1].value;
  };

  // Hourly distribution (store hours 7 AM - 10 PM, lunch and early evening busier)
  const hourSlots = [
    { value: 7, weight: 1 }, { value: 8, weight: 2 },
    { value: 9, weight: 3 }, { value: 10, weight: 4 },
    { value: 11, weight: 6 }, { value: 12, weight: 7 },
    { value: 13, weight: 6 }, { value: 14, weight: 5 },
    { value: 15, weight: 4 }, { value: 16, weight: 5 },
    { value: 17, weight: 7 }, { value: 18, weight: 8 },
    { value: 19, weight: 6 }, { value: 20, weight: 4 },
    { value: 21, weight: 2 }, { value: 22, weight: 1 },
  ];

  // Payment method mix typical for PH convenience/retail
  const paymentOptions = [
    { value: 'Cash', weight: 55 },
    { value: 'QR Code', weight: 20 },
    { value: 'Card', weight: 25 },
  ];

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const createdDate = new Date(now);
    createdDate.setDate(now.getDate() - (days - 1 - dayIndex));
    const dayOfWeek = createdDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekday vs weekend volume variance
    const baseMin = isWeekend ? 25 : 35;
    const baseMax = isWeekend ? 60 : 80;
    const count = baseMin + Math.floor(Math.random() * (baseMax - baseMin + 1));

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

      // Occasional small promos/rounding (5-15% chance, 5-12% discount)
      const applyDiscount = Math.random() < 0.12;
      const discountRate = applyDiscount ? (5 + Math.floor(Math.random() * 8)) / 100 : 0;
      const discount = Number((subtotal * discountRate).toFixed(2));

      const vat = Number(((subtotal - discount) * 0.12).toFixed(2));
      const total = Number((subtotal - discount + vat).toFixed(2));

      const cashier = randomPick(cashiers);
      const hour = weightedPick(hourSlots);
      const minute = Math.floor(Math.random() * 60);
      const createdAt = new Date(createdDate);
      createdAt.setHours(hour, minute, 0, 0);

      // Payment method and cash fields
      const paymentMethod = weightedPick(paymentOptions);
      let cashReceived = 0;
      let change = 0;
      if (paymentMethod === 'Cash') {
        // Simulate customer giving a round amount >= total
        const roundUp = [0, 10, 20, 50, 100, 200];
        const base = Math.ceil(total / 10) * 10;
        cashReceived = base + randomPick(roundUp);
        if (cashReceived < total) cashReceived = Math.ceil(total);
        change = Number((cashReceived - total).toFixed(2));
      }

      transactions.push({
        company_name: company.name,
        items,
        subtotal,
        discount,
        vat,
        total,
        totalAmount: total,
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? cashReceived : 0,
        change: paymentMethod === 'Cash' ? change : 0,
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
      name: 'Jasmine Camasura',
      user_id: 'ADMIN-KZNT-000',
      password: 'admin123',
      company_name: 'Kaizen Tech',
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
    console.log('  User ID: ADMIN-KZNT-000');
    console.log('  Password: admin123');
    console.log('  Company: Kaizen Tech');
    console.log('\nPer-Company Accounts:');
    COMPANIES.forEach((c) => {
      console.log(`\n${c.name}:`);
      console.log(`  Manager: ${c.code}-MGR-001 / manager123`);
      console.log(`  Inventory: ${c.code}-INV-001 / inventory123`);
      console.log(`  Cashier: ${c.code}-CSH-001 / cashier123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
