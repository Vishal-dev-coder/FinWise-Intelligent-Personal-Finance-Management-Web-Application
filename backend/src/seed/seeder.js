const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './.env' });

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Debt = require('../models/Debt');
const Investment = require('../models/Investment');
const Bill = require('../models/Bill');
const FinancialTip = require('../models/FinancialTip');
const Feedback = require('../models/Feedback');
const AdminLog = require('../models/AdminLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finwise';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to database');

    // Clean existing records
    await Promise.all([
      User.deleteMany(),
      Transaction.deleteMany(),
      Budget.deleteMany(),
      Goal.deleteMany(),
      Debt.deleteMany(),
      Investment.deleteMany(),
      Bill.deleteMany(),
      FinancialTip.deleteMany(),
      Feedback.deleteMany(),
      AdminLog.deleteMany(),
    ]);
    console.log('[Seeder] Cleared previous records');

    // 1. Create Admin Account (pre('save') in User model will hash it once)
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@finwise.com',
      password: 'Admin@123',
      role: 'admin',
      currency: 'USD',
      monthlyIncome: 9500,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'FinWise Chief Platform Administrator',
    });

    // 2. Create Demo User Account (pre('save') in User model will hash it once)
    const demoUser = await User.create({
      name: 'Alex Morgan',
      email: 'user@finwise.com',
      password: 'User@123',
      role: 'user',
      currency: 'USD',
      monthlyIncome: 6500,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'Senior Software Engineer striving for early financial independence (FIRE).',
      phone: '+1 (555) 234-8901',
      gamification: {
        streakDays: 12,
        lastActiveDate: new Date(),
        badges: [
          {
            id: 'early-adopter',
            name: 'Pioneer Member',
            description: 'Joined FinWise in inaugural cohort',
            icon: 'Sparkles',
            earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'streak-7',
            name: 'Consistent Tracker',
            description: 'Logged financial activity 7 days consecutive streak',
            icon: 'Flame',
            earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'budget-master',
            name: 'Budget Guardian',
            description: 'Maintained all category budgets under 100% for an entire month',
            icon: 'ShieldCheck',
            earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    });

    console.log('[Seeder] Created Admin and Demo User');

    // 3. Populate 60+ Realistic Transactions (Spanning last 4 months up to current day)
    const now = new Date();
    const transactions = [];

    const generateTransactionsForMonth = (monthOffset) => {
      const baseDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const daysInM = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0).getDate();
      const maxDay = monthOffset === 0 ? Math.min(now.getDate(), daysInM) : daysInM;

      // Regular Salary (1st of month)
      transactions.push({
        user: demoUser._id,
        title: 'Monthly Tech Salary Deposit',
        amount: 6500,
        type: 'income',
        category: 'Salary',
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 9, 30),
        paymentMethod: 'bank_transfer',
        mood: 'happy',
        isRecurring: true,
        recurringFrequency: 'monthly',
        note: 'Direct payroll deposit from Acme Labs Corp.',
      });

      // Freelance / Consulting (15th of month)
      transactions.push({
        user: demoUser._id,
        title: 'UI/UX Design Consulting Gig',
        amount: 850,
        type: 'income',
        category: 'Freelance',
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), Math.min(15, maxDay), 14, 0),
        paymentMethod: 'bank_transfer',
        mood: 'happy',
        isRecurring: false,
        note: 'Stripe payout for landing page redesign project',
      });

      // Investment Dividend (22nd of month)
      if (maxDay >= 22) {
        transactions.push({
          user: demoUser._id,
          title: 'S&P 500 Index Fund Dividend',
          amount: 145.5,
          type: 'income',
          category: 'Investment',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 22, 11, 15),
          paymentMethod: 'wallet',
          mood: 'happy',
          note: 'Quarterly reinvested dividend distribution',
        });
      }

      // Rent / Mortgage (1st of month)
      transactions.push({
        user: demoUser._id,
        title: 'Apartment Luxury Rent',
        amount: 1800,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 12, 0),
        paymentMethod: 'bank_transfer',
        mood: 'necessary',
        isRecurring: true,
        recurringFrequency: 'monthly',
        note: 'Monthly lease payment',
      });

      // Utilities (3rd of month)
      if (maxDay >= 3) {
        transactions.push({
          user: demoUser._id,
          title: 'City Power & Clean Water',
          amount: 135,
          type: 'expense',
          category: 'Utilities',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 3, 10, 0),
          paymentMethod: 'upi',
          mood: 'necessary',
          note: 'Electric and water meter reading',
        });
      }

      // Fiber Internet (5th of month)
      if (maxDay >= 5) {
        transactions.push({
          user: demoUser._id,
          title: 'Gigabit Fiber Internet',
          amount: 79.99,
          type: 'expense',
          category: 'Utilities',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5, 8, 45),
          paymentMethod: 'card',
          mood: 'necessary',
          note: 'Fiber optic high-speed home internet',
        });
      }

      // Weekly Groceries
      const groceryDays = [4, 11, 18, 25];
      groceryDays.forEach((day, idx) => {
        if (day <= maxDay) {
          transactions.push({
            user: demoUser._id,
            title: `Whole Foods Market Grocery Run #${idx + 1}`,
            amount: 110 + (idx * 14.5),
            type: 'expense',
            category: 'Groceries',
            date: new Date(baseDate.getFullYear(), baseDate.getMonth(), day, 17, 30),
            paymentMethod: 'card',
            mood: 'necessary',
            note: 'Organic produce, dairy, fruits, proteins',
          });
        }
      });

      // Dining Out & Cafes
      const diningDays = [6, 13, 20, 27];
      diningDays.forEach((day) => {
        if (day <= maxDay) {
          transactions.push({
            user: demoUser._id,
            title: 'Artisan Bistro & Sushi Dinner',
            amount: 68.5,
            type: 'expense',
            category: 'Dining Out',
            date: new Date(baseDate.getFullYear(), baseDate.getMonth(), day, 20, 15),
            paymentMethod: 'card',
            mood: 'happy',
            note: 'Dinner with friends on weekend',
          });
        }
      });

      // Special shopping / gadgets
      if (maxDay >= 8) {
        transactions.push({
          user: demoUser._id,
          title: 'Noise Cancelling Headphones',
          amount: 249.99,
          type: 'expense',
          category: 'Shopping',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 8, 15, 20),
          paymentMethod: 'card',
          mood: monthOffset === 0 ? 'happy' : 'impulsive',
          note: 'Sony WH-1000XM5 office headphones',
        });
      }

      // Fuel / Transit
      if (maxDay >= 10) {
        transactions.push({
          user: demoUser._id,
          title: 'Shell Gas Station Fill-up',
          amount: 55.4,
          type: 'expense',
          category: 'Transportation',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 10, 8, 15),
          paymentMethod: 'card',
          mood: 'necessary',
        });
      }

      // Subscriptions
      if (maxDay >= 12) {
        transactions.push({
          user: demoUser._id,
          title: 'Netflix 4K Ultra HD',
          amount: 19.99,
          type: 'expense',
          category: 'Subscriptions',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 12, 6, 0),
          paymentMethod: 'card',
          mood: 'necessary',
          isRecurring: true,
        });
      }

      if (maxDay >= 14) {
        transactions.push({
          user: demoUser._id,
          title: 'Spotify Family Premium',
          amount: 16.99,
          type: 'expense',
          category: 'Subscriptions',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 14, 6, 0),
          paymentMethod: 'card',
          mood: 'necessary',
          isRecurring: true,
        });
      }

      // Entertainment
      if (maxDay >= 16) {
        transactions.push({
          user: demoUser._id,
          title: 'IMAX Cinema Tickets & Popcorn',
          amount: 42.0,
          type: 'expense',
          category: 'Entertainment',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 16, 19, 0),
          paymentMethod: 'upi',
          mood: 'happy',
        });
      }

      // Healthcare / Gym
      if (maxDay >= 2) {
        transactions.push({
          user: demoUser._id,
          title: 'Equinox Health Club Membership',
          amount: 120,
          type: 'expense',
          category: 'Healthcare',
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 2, 7, 0),
          paymentMethod: 'card',
          mood: 'necessary',
          isRecurring: true,
        });
      }
    };

    // Populate for past 4 months (monthOffset 3, 2, 1, 0)
    [3, 2, 1, 0].forEach(generateTransactionsForMonth);

    await Transaction.insertMany(transactions);
    console.log(`[Seeder] Inserted ${transactions.length} realistic transactions`);

    // 4. Create Category Budgets
    await Budget.insertMany([
      {
        user: demoUser._id,
        category: 'Housing & Rent',
        limit: 1900,
        period: 'monthly',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
      {
        user: demoUser._id,
        category: 'Groceries',
        limit: 600,
        period: 'monthly',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
      {
        user: demoUser._id,
        category: 'Dining Out',
        limit: 350,
        period: 'monthly',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
      {
        user: demoUser._id,
        category: 'Entertainment',
        limit: 200,
        period: 'monthly',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
      {
        user: demoUser._id,
        category: 'Transportation',
        limit: 250,
        period: 'monthly',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
      {
        user: demoUser._id,
        category: 'Shopping',
        limit: 400,
        period: 'monthly',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
    ]);
    console.log('[Seeder] Created 6 category budgets');

    // 5. Create Savings Goals
    await Goal.insertMany([
      {
        user: demoUser._id,
        title: 'Emergency Rainy Day Reserve',
        targetAmount: 18000,
        currentAmount: 14200,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 15),
        category: 'Emergency Fund',
        color: '#10B981',
      },
      {
        user: demoUser._id,
        title: 'Tokyo Cherry Blossom Trip',
        targetAmount: 4500,
        currentAmount: 3200,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 20),
        category: 'Travel',
        color: '#3B82F6',
      },
      {
        user: demoUser._id,
        title: 'Tesla Model 3 Down Payment',
        targetAmount: 12000,
        currentAmount: 7800,
        targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
        category: 'Vehicle',
        color: '#8B5CF6',
      },
      {
        user: demoUser._id,
        title: 'Apple Vision Pro / Gadgets',
        targetAmount: 3500,
        currentAmount: 3500,
        targetDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        category: 'Gadget',
        color: '#EC4899',
        isCompleted: true,
        completedAt: new Date(),
        badgeAwarded: true,
      },
    ]);
    console.log('[Seeder] Created 4 savings goals');

    // 6. Create Debts / Loans
    await Debt.insertMany([
      {
        user: demoUser._id,
        title: 'Car Loan - Mazda CX-30',
        lender: 'Chase Auto Finance',
        debtType: 'car_loan',
        principalAmount: 22000,
        remainingBalance: 11400,
        interestRate: 4.8,
        monthlyEmi: 412,
        dueDateDay: 10,
        paymentHistory: [
          { amount: 412, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), note: 'Monthly EMI' },
          { amount: 412, date: new Date(now.getFullYear(), now.getMonth() - 2, 10), note: 'Monthly EMI' },
        ],
      },
      {
        user: demoUser._id,
        title: 'Undergraduate Student Loan',
        lender: 'Nelnet Federal Servicing',
        debtType: 'student_loan',
        principalAmount: 18000,
        remainingBalance: 5200,
        interestRate: 3.6,
        monthlyEmi: 280,
        dueDateDay: 18,
        paymentHistory: [
          { amount: 280, date: new Date(now.getFullYear(), now.getMonth() - 1, 18), note: 'Federal repayment' },
        ],
      },
      {
        user: demoUser._id,
        title: 'Sapphire Preferred Credit Card',
        lender: 'JPMorgan Chase',
        debtType: 'credit_card',
        principalAmount: 1500,
        remainingBalance: 420,
        interestRate: 19.9,
        monthlyEmi: 150,
        dueDateDay: 24,
      },
    ]);
    console.log('[Seeder] Created 3 debt liabilities');

    // 7. Create Investments Portfolio
    await Investment.insertMany([
      {
        user: demoUser._id,
        name: 'Vanguard S&P 500 Index ETF',
        symbol: 'VOO',
        type: 'mutual_funds',
        investedAmount: 12000,
        currentValue: 14850,
        units: 32,
        buyPricePerUnit: 375,
        purchaseDate: new Date(now.getFullYear() - 1, 3, 12),
        notes: 'Core passive ETF long-term retirement anchor.',
      },
      {
        user: demoUser._id,
        name: 'Apple Inc.',
        symbol: 'AAPL',
        type: 'stocks',
        investedAmount: 5000,
        currentValue: 6920,
        units: 30,
        buyPricePerUnit: 166.6,
        purchaseDate: new Date(now.getFullYear() - 1, 6, 20),
        notes: 'High conviction blue chip tech growth holding.',
      },
      {
        user: demoUser._id,
        name: 'Bitcoin Digital Asset',
        symbol: 'BTC',
        type: 'crypto',
        investedAmount: 4000,
        currentValue: 6150,
        units: 0.095,
        buyPricePerUnit: 42100,
        purchaseDate: new Date(now.getFullYear() - 1, 9, 5),
        notes: 'Store of value digital gold allocation.',
      },
      {
        user: demoUser._id,
        name: 'Sovereign Physical Gold ETF',
        symbol: 'GLD',
        type: 'gold',
        investedAmount: 3000,
        currentValue: 3340,
        units: 18,
        buyPricePerUnit: 166,
        purchaseDate: new Date(now.getFullYear() - 2, 1, 10),
        notes: 'Inflation hedge and safe haven reserve.',
      },
      {
        user: demoUser._id,
        name: 'Prologis Industrial REIT',
        symbol: 'PLD',
        type: 'real_estate',
        investedAmount: 3500,
        currentValue: 3820,
        units: 31,
        buyPricePerUnit: 112.9,
        purchaseDate: new Date(now.getFullYear() - 1, 11, 1),
        notes: 'Commercial logistics real estate dividend play.',
      },
    ]);
    console.log('[Seeder] Created 5 diversified investment assets');

    // 8. Create Bills & Subscriptions
    await Bill.insertMany([
      {
        user: demoUser._id,
        title: 'Electricity & Gas Grid Bill',
        amount: 145,
        category: 'Utilities',
        frequency: 'monthly',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4),
        isSubscription: false,
        isPaid: false,
        autoPay: true,
      },
      {
        user: demoUser._id,
        title: 'Netflix Ultra HD Subscription',
        amount: 19.99,
        category: 'Streaming',
        frequency: 'monthly',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9),
        isSubscription: true,
        isPaid: false,
        autoPay: true,
      },
      {
        user: demoUser._id,
        title: 'Spotify Premium Family',
        amount: 16.99,
        category: 'Streaming',
        frequency: 'monthly',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 11),
        isSubscription: true,
        isPaid: false,
        autoPay: true,
      },
      {
        user: demoUser._id,
        title: 'Equinox Gym & Spa',
        amount: 120,
        category: 'Fitness',
        frequency: 'monthly',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        isSubscription: true,
        isPaid: false,
      },
      {
        user: demoUser._id,
        title: 'Geico Comprehensive Auto Insurance',
        amount: 118.5,
        category: 'Insurance',
        frequency: 'monthly',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 19),
        isSubscription: false,
        isPaid: false,
      },
    ]);
    console.log('[Seeder] Created 5 recurring bills and subscriptions');

    // 9. Create Curated Financial Tips
    await FinancialTip.insertMany([
      {
        title: 'The 50/30/20 Budgeting Rule Explained',
        category: 'Budgeting',
        content: 'The 50/30/20 framework is an intuitive rule of thumb to divide your after-tax income: 50% for essential needs (rent, utilities, groceries), 30% for discretionary lifestyle wants, and at least 20% dedicated to savings, investments, and debt paydown.',
        actionableAdvice: 'Audit your current month expenses in FinWise to see what percentage your "Needs" occupy. If they exceed 60%, explore downsizing fixed utility plans.',
        readingTimeMinutes: 3,
        isFeatured: true,
      },
      {
        title: 'Debt Avalanche vs Debt Snowball Method',
        category: 'Debt Management',
        content: 'The Avalanche method prioritizes paying off debts with the highest interest rates first to minimize mathematical interest expense. The Snowball method pays off the smallest balance loans first to build psychological momentum.',
        actionableAdvice: 'If you are motivated by quick wins, use Snowball. If you prefer optimal math savings, use the Avalanche strategy.',
        readingTimeMinutes: 4,
        isFeatured: true,
      },
      {
        title: 'Building a Resilient 6-Month Emergency Buffer',
        category: 'Saving',
        content: 'An emergency fund is insurance against life\'s unpredictabilities—job layoffs, medical bills, or sudden auto repairs. Storing 3 to 6 months of baseline living expenses in a liquid High-Yield Savings Account protects you from liquidating investments at a loss.',
        actionableAdvice: 'Set up an automated transfer on every payday specifically towards your Emergency Fund goal.',
        readingTimeMinutes: 2,
        isFeatured: true,
      },
      {
        title: 'Dollar Cost Averaging (DCA) into Index Funds',
        category: 'Investing',
        content: 'Attempting to time the market peaks and bottoms rarely succeeds over decades. Dollar Cost Averaging involves investing a fixed dollar amount into index funds at regular intervals regardless of current price fluctuations.',
        actionableAdvice: 'Automate a weekly or monthly contribution to broad index funds like VOO or VTI to neutralize market volatility.',
        readingTimeMinutes: 3,
        isFeatured: false,
      },
      {
        title: 'The Hidden Danger of "Micro-Subscriptions"',
        category: 'Smart Shopping',
        content: 'A $9 app subscription here and an $8 music service there might feel negligible, but 10 forgotten subscriptions cost over $1,200 annually. Recurring digital charges are designed to slip under our cognitive radar.',
        actionableAdvice: 'Use FinWise\'s Subscription Leakage Detector on the Bills page every 60 days to cancel duplicate streaming tiers.',
        readingTimeMinutes: 2,
        isFeatured: false,
      },
    ]);
    console.log('[Seeder] Created financial tips');

    // 10. Sample User Feedback
    await Feedback.insertMany([
      {
        user: demoUser._id,
        subject: 'Loved the Voice Expense Entry feature!',
        category: 'UI/UX Improvement',
        message: 'The ability to speak my grocery expense while walking to my car saved me so much time. Would love to see dark mode toggle remembered across devices.',
        rating: 5,
        status: 'resolved',
        adminResponse: 'Thank you Alex! Dark mode preference is now synced to your profile settings automatically.',
      },
      {
        user: demoUser._id,
        subject: 'Request: Cryptocurrency price feed integration',
        category: 'Feature Request',
        message: 'Could we get live CoinGecko pricing for crypto portfolio assets in addition to manual market value input?',
        rating: 4,
        status: 'in_review',
        adminResponse: 'Under review by our engineering team for the upcoming v2.1 release roadmap.',
      },
    ]);
    console.log('[Seeder] Created demo feedback items');

    // 11. Initial Admin Log
    await AdminLog.create({
      admin: adminUser._id,
      action: 'SYSTEM_INITIALIZATION',
      targetEntity: 'Database',
      details: 'Initial database seeding completed successfully with demo portfolios, users, and audit records.',
    });

    console.log('----------------------------------------------------');
    console.log('FinWise Seeding completed successfully!');
    console.log('Demo User:  user@finwise.com  |  User@123');
    console.log('Admin User: admin@finwise.com |  Admin@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]', err);
    process.exit(1);
  }
};

seedData();
