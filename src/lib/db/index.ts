import Dexie, { type EntityTable } from 'dexie';
import type { Product, Customer, Transaction, Expense, DuePayment, ProductCategory, Settings } from '@/types';

const db = new Dexie('ConvenienceStoreDB') as Dexie & {
  products: EntityTable<Product, 'id'>;
  customers: EntityTable<Customer, 'id'>;
  transactions: EntityTable<Transaction, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  duePayments: EntityTable<DuePayment, 'id'>;
  categories: EntityTable<ProductCategory, 'id'>;
  settings: EntityTable<Settings, 'id'>;
};

// Database schema
db.version(1).stores({
  products: 'id, name, category, deleted, createdAt',
  customers: 'id, name, phone, deleted, createdAt',
  transactions: 'id, customerId, paymentMethod, deleted, createdAt',
  expenses: 'id, category, deleted, date, createdAt',
  duePayments: 'id, customerId, createdAt',
  categories: 'id, name',
  settings: 'id'
});

export { db };

// Helper functions for Products
export const productOperations = {
  async getAll() {
    return db.products.where('deleted').equals(0).toArray();
  },

  async getById(id: string) {
    return db.products.get(id);
  },

  async add(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.products.add({
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false
    });
    return id;
  },

  async update(id: string, updates: Partial<Product>) {
    await db.products.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async softDelete(id: string) {
    await db.products.update(id, {
      deleted: true,
      updatedAt: new Date()
    });
  },

  async getLowStock() {
    const products = await db.products.where('deleted').equals(0).toArray();
    return products.filter(p => p.quantity <= p.minStock);
  },

  async getByCategory(category: string) {
    return db.products.where(['category', 'deleted']).equals([category, 0]).toArray();
  },

  async updateStock(id: string, quantityChange: number) {
    const product = await db.products.get(id);
    if (product) {
      await db.products.update(id, {
        quantity: product.quantity + quantityChange,
        updatedAt: new Date()
      });
    }
  }
};

// Helper functions for Customers
export const customerOperations = {
  async getAll() {
    return db.customers.where('deleted').equals(0).toArray();
  },

  async getById(id: string) {
    return db.customers.get(id);
  },

  async add(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'totalDue'>) {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.customers.add({
      ...customer,
      id,
      totalDue: 0,
      createdAt: now,
      updatedAt: now,
      deleted: false
    });
    return id;
  },

  async update(id: string, updates: Partial<Customer>) {
    await db.customers.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async softDelete(id: string) {
    await db.customers.update(id, {
      deleted: true,
      updatedAt: new Date()
    });
  },

  async updateDue(id: string, amount: number) {
    const customer = await db.customers.get(id);
    if (customer) {
      await db.customers.update(id, {
        totalDue: customer.totalDue + amount,
        updatedAt: new Date()
      });
    }
  },

  async getWithDue() {
    const customers = await db.customers.where('deleted').equals(0).toArray();
    return customers.filter(c => c.totalDue > 0);
  }
};

// Helper functions for Transactions
export const transactionOperations = {
  async getAll() {
    return db.transactions.where('deleted').equals(0).reverse().sortBy('createdAt');
  },

  async getById(id: string) {
    return db.transactions.get(id);
  },

  async add(transaction: Omit<Transaction, 'id' | 'createdAt' | 'deleted'>) {
    const id = crypto.randomUUID();
    const now = new Date();
    
    // Update product stock
    for (const item of transaction.items) {
      await productOperations.updateStock(item.productId, -item.quantity);
    }

    // If due payment, update customer due
    if (transaction.paymentMethod === 'due' && transaction.customerId) {
      await customerOperations.updateDue(transaction.customerId, transaction.totalAmount);
    }

    await db.transactions.add({
      ...transaction,
      id,
      createdAt: now,
      deleted: false
    });

    return id;
  },

  async softDelete(id: string) {
    const transaction = await db.transactions.get(id);
    if (transaction) {
      // Restore product stock
      for (const item of transaction.items) {
        await productOperations.updateStock(item.productId, item.quantity);
      }

      // If it was a due payment, reduce customer due
      if (transaction.paymentMethod === 'due' && transaction.customerId) {
        await customerOperations.updateDue(transaction.customerId, -transaction.totalAmount);
      }

      await db.transactions.update(id, { deleted: true });
    }
  },

  async getByDateRange(startDate: Date, endDate: Date) {
    const transactions = await db.transactions
      .where('deleted').equals(0)
      .filter(t => {
        const date = new Date(t.createdAt);
        return date >= startDate && date <= endDate;
      })
      .toArray();
    return transactions;
  },

  async getByCustomer(customerId: string) {
    return db.transactions
      .where(['customerId', 'deleted'])
      .equals([customerId, 0])
      .reverse()
      .sortBy('createdAt');
  },

  async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getByDateRange(today, tomorrow);
  }
};

// Helper functions for Expenses
export const expenseOperations = {
  async getAll() {
    return db.expenses.where('deleted').equals(0).reverse().sortBy('date');
  },

  async getById(id: string) {
    return db.expenses.get(id);
  },

  async add(expense: Omit<Expense, 'id' | 'createdAt' | 'deleted'>) {
    const id = crypto.randomUUID();
    await db.expenses.add({
      ...expense,
      id,
      createdAt: new Date(),
      deleted: false
    });
    return id;
  },

  async update(id: string, updates: Partial<Expense>) {
    await db.expenses.update(id, updates);
  },

  async softDelete(id: string) {
    await db.expenses.update(id, { deleted: true });
  },

  async getByDateRange(startDate: Date, endDate: Date) {
    return db.expenses
      .where('deleted').equals(0)
      .filter(e => {
        const date = new Date(e.date);
        return date >= startDate && date <= endDate;
      })
      .toArray();
  },

  async getTodayExpenses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getByDateRange(today, tomorrow);
  }
};

// Helper functions for Due Payments
export const duePaymentOperations = {
  async add(payment: Omit<DuePayment, 'id' | 'createdAt'>) {
    const id = crypto.randomUUID();
    
    // Reduce customer due
    await customerOperations.updateDue(payment.customerId, -payment.amount);
    
    await db.duePayments.add({
      ...payment,
      id,
      createdAt: new Date()
    });
    
    return id;
  },

  async getByCustomer(customerId: string) {
    return db.duePayments.where('customerId').equals(customerId).reverse().sortBy('createdAt');
  }
};

// Helper functions for Categories
export const categoryOperations = {
  async getAll() {
    return db.categories.toArray();
  },

  async add(name: string) {
    const id = crypto.randomUUID();
    await db.categories.add({
      id,
      name,
      createdAt: new Date()
    });
    return id;
  },

  async delete(id: string) {
    await db.categories.delete(id);
  }
};

// Helper functions for Settings
export const settingsOperations = {
  async get() {
    const settings = await db.settings.toArray();
    return settings[0] || {
      id: 'default',
      storeName: 'My Store',
      storeAddress: '',
      storePhone: '',
      currency: '$'
    };
  },

  async update(settings: Partial<Settings>) {
    const existing = await this.get();
    await db.settings.put({
      ...existing,
      ...settings,
      id: 'default'
    });
  }
};

// Report helpers
export const reportOperations = {
  async getDailyReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const transactions = await transactionOperations.getByDateRange(startOfDay, endOfDay);
    const expenses = await expenseOperations.getByDateRange(startOfDay, endOfDay);

    const sales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const profit = transactions.reduce((sum, t) => sum + t.profit, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      date: startOfDay.toISOString().split('T')[0],
      sales,
      expenses: totalExpenses,
      profit: profit - totalExpenses,
      transactions: transactions.length
    };
  },

  async getWeeklyReport() {
    const reports: { date: string; sales: number; expenses: number; profit: number; transactions: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      reports.push(await this.getDailyReport(date));
    }

    return reports;
  },

  async getMonthlyReport() {
    const reports: { date: string; sales: number; expenses: number; profit: number; transactions: number }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      reports.push(await this.getDailyReport(date));
    }

    return reports;
  },

  async getYearlyReport() {
    const reports: { month: string; sales: number; expenses: number; profit: number }[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const transactions = await transactionOperations.getByDateRange(month, monthEnd);
      const expenses = await expenseOperations.getByDateRange(month, monthEnd);

      const sales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const profit = transactions.reduce((sum, t) => sum + t.profit, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      reports.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sales,
        expenses: totalExpenses,
        profit: profit - totalExpenses
      });
    }

    return reports;
  },

  async getTopProducts(limit: number = 10) {
    const transactions = await db.transactions.where('deleted').equals(0).toArray();
    const productMap = new Map<string, { productId: string; productName: string; quantity: number; revenue: number; profit: number }>();

    for (const transaction of transactions) {
      for (const item of transaction.items) {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
          existing.profit += (item.unitPrice - item.buyPrice) * item.quantity;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.totalPrice,
            profit: (item.unitPrice - item.buyPrice) * item.quantity
          });
        }
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },

  async getTopCustomers(limit: number = 10) {
    const customers = await customerOperations.getWithDue();
    return customers
      .sort((a, b) => b.totalDue - a.totalDue)
      .slice(0, limit)
      .map(c => ({
        customerId: c.id,
        customerName: c.name,
        totalPurchases: 0,
        totalDue: c.totalDue
      }));
  }
};
