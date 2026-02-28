'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Product, Customer, Sale, Expense, SaleItem } from '@/lib/types';
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, subDays, subMonths, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  ShoppingCart, Package, DollarSign, TrendingUp, 
  Plus, Trash2, Edit, Search, CreditCard, Wallet, Receipt,
  AlertCircle, X, Scale
} from 'lucide-react';
import { 
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Currency formatter for Bangladeshi Taka
const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

// Premium Loading Spinner Component
function PremiumSpinner() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full opacity-50 animate-pulse"></div>
        
        {/* Main spinner container */}
        <div className="relative w-32 h-32">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400 animate-spin"></div>
          
          {/* Middle ring */}
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-cyan-400 border-l-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Inner ring */}
          <div className="absolute inset-6 rounded-full border-4 border-transparent border-t-pink-400 border-b-cyan-400 animate-spin" style={{ animationDuration: '2s' }}></div>
          
          {/* Center dot with pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full shadow-lg shadow-white/50 animate-pulse"></div>
          </div>
          
          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-purple-400/50"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 translate-y-1/2 shadow-lg shadow-cyan-400/50"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '2s' }}>
            <div className="absolute left-0 top-1/2 w-2 h-2 bg-pink-400 rounded-full -translate-y-1/2 -translate-x-1/2 shadow-lg shadow-pink-400/50"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="mt-8 text-center">
          <p className="text-white text-lg font-medium tracking-wider">Loading...</p>
          <p className="text-purple-300 text-sm mt-1">Store Manager</p>
        </div>
      </div>
    </div>
  );
}

// Custom hook for client-side only rendering
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  const mounted = useRef(false);
  
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsClient(true);
    }
  }, []);
  
  return isClient;
}

export default function Home() {
  const isClient = useIsClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    products, customers, sales, duePayments, expenses,
    addProduct, updateProduct, deleteProduct,
    addCustomer, deleteCustomer,
    addSale, deleteSale, addDuePayment,
    addExpense, deleteExpense
  } = useStore();

  const loadData = useStore(state => state.loadData);

  useEffect(() => {
    if (isClient) {
      loadData();
    }
  }, [isClient, loadData]);

  if (!isClient) {
    return <PremiumSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <StoreIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <span className="hidden sm:inline">Store Manager</span>
              <span className="sm:hidden">Store</span>
            </h1>
            <div className="text-xs sm:text-sm text-gray-500">
              {format(new Date(), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <TabsList className="grid grid-cols-6 sm:grid-cols-6 mb-4 sm:mb-6 min-w-[400px] sm:min-w-0">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2 sm:px-4">Home</TabsTrigger>
              <TabsTrigger value="sales" className="text-xs sm:text-sm px-2 sm:px-4">Sales</TabsTrigger>
              <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-4">Products</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs sm:text-sm px-2 sm:px-4">Customers</TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm px-2 sm:px-4">Expenses</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 sm:px-4">Reports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <Dashboard setActiveTab={setActiveTab} />
          </TabsContent>
          <TabsContent value="sales">
            <SalesModule />
          </TabsContent>
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>
          <TabsContent value="expenses">
            <ExpenseTracking />
          </TabsContent>
          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

// ============ DASHBOARD COMPONENT ============
function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { products, customers, sales, expenses, duePayments } = useStore();
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [quickProductOpen, setQuickProductOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const todaySales = sales.filter(s => 
    isWithinInterval(new Date(s.createdAt), { start: todayStart, end: todayEnd })
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  
  const totalDue = customers.reduce((sum, c) => {
    const customerDue = sales
      .filter(s => s.customerId === c.id && s.paymentType === 'due')
      .reduce((s, sale) => s + sale.total, 0) -
      duePayments.filter(p => p.customerId === c.id)
        .reduce((s, p) => s + p.amount, 0);
    return sum + customerDue;
  }, 0);

  const lowStockProducts = products.filter(p => p.stock <= 5);
  
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthlyRevenue = sales
    .filter(s => isWithinInterval(new Date(s.createdAt), { start: monthStart, end: monthEnd }))
    .reduce((sum, s) => sum + s.total, 0);

  const monthlyExpenses = expenses
    .filter(e => isWithinInterval(new Date(e.createdAt), { start: monthStart, end: monthEnd }))
    .reduce((sum, e) => sum + e.amount, 0);

  const recentSales = [...sales].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-green-50 to-white" onClick={() => setActiveTab('sales')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Today&apos;s Sales</CardTitle>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-700">{formatCurrency(todayRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">{todaySales.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-orange-50 to-white" onClick={() => setActiveTab('customers')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Due</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-700">{formatCurrency(totalDue)}</div>
            <p className="text-xs text-gray-500 mt-1">Outstanding</p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${lowStockProducts.length > 0 ? 'bg-gradient-to-br from-red-50 to-white border-red-200' : 'bg-gradient-to-br from-gray-50 to-white'}`} onClick={() => setActiveTab('products')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Low Stock</CardTitle>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Need restock</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-white" onClick={() => setActiveTab('reports')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Monthly Profit</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${monthlyRevenue - monthlyExpenses >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
              {formatCurrency(monthlyRevenue - monthlyExpenses)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Rev: {formatCurrency(monthlyRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Button onClick={() => setQuickSaleOpen(true)} className="h-16 sm:h-20 text-sm sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">New </span>Sale
        </Button>
        <Button variant="outline" onClick={() => setQuickProductOpen(true)} className="h-16 sm:h-20 text-sm sm:text-lg border-2 hover:bg-gray-50">
          <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add </span>Product
        </Button>
        <Button variant="secondary" onClick={() => setQuickExpenseOpen(true)} className="h-16 sm:h-20 text-sm sm:text-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300">
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add </span>Expense
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-md">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
          <CardDescription>Last 5 sales</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sales yet</p>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs">Payment</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="text-xs">{format(new Date(sale.createdAt), 'MMM d, h:mm a')}</TableCell>
                      <TableCell className="text-xs">{sale.items.length} items</TableCell>
                      <TableCell>
                        <Badge variant={sale.paymentType === 'cash' ? 'default' : 'secondary'} className="text-xs">
                          {sale.paymentType === 'cash' ? 'Cash' : 'Due'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">{formatCurrency(sale.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <QuickSaleDialog open={quickSaleOpen} onClose={() => setQuickSaleOpen(false)} />
      <QuickProductDialog open={quickProductOpen} onClose={() => setQuickProductOpen(false)} />
      <QuickExpenseDialog open={quickExpenseOpen} onClose={() => setQuickExpenseOpen(false)} />
    </div>
  );
}

// ============ PRODUCT MANAGEMENT ============
function ProductManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    pricingType: 'fixed' as 'fixed' | 'weight',
    unit: 'pcs'
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      category: formData.category || 'General',
      pricingType: formData.pricingType,
      unit: formData.pricingType === 'weight' ? 'kg' : formData.unit,
    };

    if (editProduct) {
      updateProduct(editProduct.id, productData);
      toast({ title: 'Success', description: 'Product updated successfully' });
    } else {
      addProduct(productData);
      toast({ title: 'Success', description: 'Product added successfully' });
    }

    setDialogOpen(false);
    setEditProduct(null);
    setFormData({ name: '', price: '', stock: '', category: '', pricingType: 'fixed', unit: 'pcs' });
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || '',
      pricingType: product.pricingType || 'fixed',
      unit: product.unit || 'pcs',
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <Input 
            placeholder="Search products..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => { 
          setEditProduct(null); 
          setFormData({ name: '', price: '', stock: '', category: '', pricingType: 'fixed', unit: 'pcs' }); 
          setDialogOpen(true); 
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Price</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Stock</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map(product => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {product.pricingType === 'weight' && (
                            <Scale className="w-4 h-4 text-purple-500" />
                          )}
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">
                        <Badge variant={product.pricingType === 'weight' ? 'default' : 'secondary'} className="text-xs">
                          {product.pricingType === 'weight' ? 'Per KG' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right">
                        {formatCurrency(product.price)}
                        {product.pricingType === 'weight' && <span className="text-gray-400 text-xs">/kg</span>}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right">
                        <span className={product.stock <= 5 ? 'text-red-600 font-semibold' : ''}>
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{product.category || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Product Name *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1" />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Pricing Type *</Label>
              <Select value={formData.pricingType} onValueChange={(v: 'fixed' | 'weight') => setFormData({ ...formData, pricingType: v, unit: v === 'weight' ? 'kg' : 'pcs' })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price (Chocolate, Cookies, etc.)</SelectItem>
                  <SelectItem value="weight">Weight-Based (Rice, Onion, Potato, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Price {formData.pricingType === 'weight' ? '(per KG) *' : '*'}
                </Label>
                <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Stock {formData.pricingType === 'weight' ? '(KG) *' : '(Quantity) *'}
                </Label>
                <Input type="number" step="0.01" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="mt-1" />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Food, Drinks, Grocery" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {editProduct ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteConfirm) {
                deleteProduct(deleteConfirm);
                toast({ title: 'Deleted', description: 'Product deleted' });
                setDeleteConfirm(null);
              }
            }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ CUSTOMER MANAGEMENT ============
function CustomerManagement() {
  const { customers, sales, duePayments, addCustomer, deleteCustomer, addDuePayment } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [paymentAmount, setPaymentAmount] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const getCustomerDue = (customerId: string) => {
    const totalDue = sales
      .filter(s => s.customerId === customerId && s.paymentType === 'due')
      .reduce((sum, s) => sum + s.total, 0);
    const totalPaid = duePayments
      .filter(p => p.customerId === customerId)
      .reduce((sum, p) => sum + p.amount, 0);
    return totalDue - totalPaid;
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter(s => s.customerId === customerId);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Customer name is required', variant: 'destructive' });
      return;
    }
    addCustomer({ name: formData.name, phone: formData.phone, address: formData.address });
    toast({ title: 'Success', description: 'Customer added' });
    setDialogOpen(false);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handlePayment = () => {
    if (!paymentDialogOpen || !paymentAmount) return;
    const customer = customers.find(c => c.id === paymentDialogOpen);
    if (!customer) return;
    addDuePayment({ customerId: paymentDialogOpen, customerName: customer.name, amount: parseFloat(paymentAmount) });
    toast({ title: 'Success', description: 'Payment recorded' });
    setPaymentDialogOpen(null);
    setPaymentAmount('');
  };

  const selectedCustomer = detailsOpen ? customers.find(c => c.id === detailsOpen) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredCustomers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-gray-500">No customers found</CardContent>
          </Card>
        ) : (
          filteredCustomers.map(customer => {
            const due = getCustomerDue(customer.id);
            return (
              <Card key={customer.id} className={`hover:shadow-lg transition-all duration-300 ${due > 0 ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' : ''}`}>
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm sm:text-base">{customer.name}</CardTitle>
                    <Badge variant={due > 0 ? 'destructive' : 'default'} className="text-xs">
                      {due > 0 ? `${formatCurrency(due)} due` : 'No due'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{customer.phone}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  {customer.address && <p className="text-xs text-gray-500 mb-2">{customer.address}</p>}
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setDetailsOpen(customer.id)}>Details</Button>
                    {due > 0 && <Button size="sm" className="text-xs bg-gradient-to-r from-green-500 to-emerald-500" onClick={() => setPaymentDialogOpen(customer.id)}>Pay</Button>}
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(customer.id)}>
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-lg">
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsOpen} onOpenChange={() => setDetailsOpen(null)}>
        <DialogContent className="max-w-sm sm:max-w-2xl">
          <DialogHeader><DialogTitle>{selectedCustomer?.name}&apos;s Details</DialogTitle></DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div><Label className="text-gray-500 text-xs">Phone</Label><p className="font-medium">{selectedCustomer.phone || '-'}</p></div>
                <div><Label className="text-gray-500 text-xs">Address</Label><p className="font-medium">{selectedCustomer.address || '-'}</p></div>
                <div><Label className="text-gray-500 text-xs">Current Due</Label><p className="font-medium text-red-500">{formatCurrency(getCustomerDue(selectedCustomer.id))}</p></div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Purchase History</Label>
                <ScrollArea className="h-48 sm:h-64 mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Items</TableHead>
                        <TableHead className="text-xs">Payment</TableHead>
                        <TableHead className="text-xs text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCustomerSales(selectedCustomer.id).map(sale => (
                        <TableRow key={sale.id}>
                          <TableCell className="text-xs">{format(new Date(sale.createdAt), 'MMM d, yy')}</TableCell>
                          <TableCell className="text-xs truncate max-w-[100px]">{sale.items.map(i => i.productName).join(', ')}</TableCell>
                          <TableCell><Badge variant={sale.paymentType === 'cash' ? 'default' : 'secondary'} className="text-xs">{sale.paymentType}</Badge></TableCell>
                          <TableCell className="text-xs text-right">{formatCurrency(sale.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentDialogOpen} onOpenChange={() => setPaymentDialogOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Due Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {paymentDialogOpen && <p className="text-base sm:text-lg">Current Due: <span className="font-bold text-red-500">{formatCurrency(getCustomerDue(paymentDialogOpen))}</span></p>}
            <div><Label>Payment Amount (৳)</Label><Input type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(null)}>Cancel</Button>
            <Button onClick={handlePayment} className="bg-gradient-to-r from-green-500 to-emerald-500">Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Customer?</AlertDialogTitle><AlertDialogDescription>Sales history will be preserved.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteConfirm) { deleteCustomer(deleteConfirm); toast({ title: 'Deleted', description: 'Customer deleted' }); setDeleteConfirm(null); } }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ SALES MODULE ============
function SalesModule() {
  const { sales, deleteSale } = useStore();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filterSales = () => {
    const now = new Date();
    let start: Date, end: Date;
    switch (dateFilter) {
      case 'today': start = startOfDay(now); end = endOfDay(now); break;
      case 'week': start = startOfWeek(now); end = endOfWeek(now); break;
      case 'month': start = startOfMonth(now); end = endOfMonth(now); break;
      default: return sales;
    }
    return sales.filter(s => isWithinInterval(new Date(s.createdAt), { start, end }));
  };

  const filteredSales = filterSales().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setNewSaleOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Items</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No sales found</TableCell></TableRow>
                ) : (
                  filteredSales.map(sale => (
                    <TableRow key={sale.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs">{format(new Date(sale.createdAt), 'MMM d, h:mm a')}</TableCell>
                      <TableCell className="text-xs">
                        <div className="truncate max-w-[120px] sm:max-w-xs">{sale.items.map(i => `${i.productName}${i.weight ? `(${i.weight}kg)` : `(${i.quantity})`}`).join(', ')}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={sale.paymentType === 'cash' ? 'default' : 'secondary'} className="text-xs">{sale.paymentType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{sale.customerName || '-'}</TableCell>
                      <TableCell className="text-xs text-right font-medium text-green-600">{formatCurrency(sale.total)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(sale.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <NewSaleDialog open={newSaleOpen} onClose={() => setNewSaleOpen(false)} />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Sale?</AlertDialogTitle><AlertDialogDescription>Inventory will be restored.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteConfirm) { deleteSale(deleteConfirm); toast({ title: 'Deleted', description: 'Sale deleted' }); setDeleteConfirm(null); } }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ NEW SALE DIALOG (Updated for Weight Support) ============
function NewSaleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, customers, addSale } = useStore();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weight, setWeight] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'due'>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const isWeightProduct = selectedProductData?.pricingType === 'weight';

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (product.pricingType === 'weight') {
      const weightKg = parseFloat(weight);
      if (weightKg <= 0 || weightKg > product.stock) {
        toast({ title: 'Error', description: `Invalid weight. Available: ${product.stock} kg`, variant: 'destructive' });
        return;
      }
      const subtotal = weightKg * product.price;
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: weightKg,
        weight: weightKg,
        price: product.price,
        subtotal,
        pricingType: 'weight',
        unit: 'kg'
      }]);
    } else {
      const qty = parseInt(quantity);
      if (qty <= 0 || qty > product.stock) {
        toast({ title: 'Error', description: `Invalid quantity. Available: ${product.stock}`, variant: 'destructive' });
        return;
      }
      const subtotal = qty * product.price;
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: product.price,
        subtotal,
        pricingType: 'fixed',
        unit: 'pcs'
      }]);
    }

    setSelectedProduct('');
    setQuantity('1');
    setWeight('');
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one item', variant: 'destructive' });
      return;
    }
    if (paymentType === 'due' && !selectedCustomer) {
      toast({ title: 'Error', description: 'Please select a customer for due payment', variant: 'destructive' });
      return;
    }
    const customer = customers.find(c => c.id === selectedCustomer);
    addSale({ 
      items, 
      total, 
      paymentType, 
      customerId: paymentType === 'due' ? selectedCustomer : undefined, 
      customerName: paymentType === 'due' ? customer?.name : undefined 
    });
    toast({ title: 'Success', description: 'Sale completed' });
    onClose();
    setItems([]);
    setPaymentType('cash');
    setSelectedCustomer('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-lg font-semibold">New Sale</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.filter(p => p.stock > 0).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      {p.pricingType === 'weight' && <Scale className="w-3 h-3 text-purple-500" />}
                      {p.name} - {formatCurrency(p.price)}{p.pricingType === 'weight' ? '/kg' : ''} (Stock: {p.stock} {p.unit})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isWeightProduct ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="Weight (kg)" 
                    value={weight} 
                    onChange={e => setWeight(e.target.value)} 
                    min="0.01"
                  />
                </div>
                <Button onClick={addItem} disabled={!selectedProduct || !weight} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Add
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  className="w-20" 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)} 
                  min="1" 
                />
                <Button onClick={addItem} disabled={!selectedProduct} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Add
                </Button>
              </div>
            )}
          </div>

          {selectedProductData && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg text-sm">
              <p><strong>{selectedProductData.name}</strong> - {formatCurrency(selectedProductData.price)}/{selectedProductData.pricingType === 'weight' ? 'kg' : 'pcs'}</p>
              <p className="text-gray-600">Available: {selectedProductData.stock} {selectedProductData.unit}</p>
            </div>
          )}

          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Product</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Qty/Weight</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell className="text-xs sm:text-sm font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <Badge variant={item.pricingType === 'weight' ? 'default' : 'secondary'} className="text-xs">
                          {item.pricingType === 'weight' ? 'Weight' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {item.pricingType === 'weight' ? `${item.weight} kg` : item.quantity}
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
            <Label className="text-sm font-medium">Payment:</Label>
            <div className="flex gap-2 flex-1">
              <Button 
                variant={paymentType === 'cash' ? 'default' : 'outline'} 
                onClick={() => setPaymentType('cash')} 
                className="flex-1 sm:flex-none"
              >
                <Wallet className="w-4 h-4 mr-2" />Cash
              </Button>
              <Button 
                variant={paymentType === 'due' ? 'default' : 'outline'} 
                onClick={() => setPaymentType('due')} 
                className="flex-1 sm:flex-none"
              >
                <CreditCard className="w-4 h-4 mr-2" />Due
              </Button>
            </div>
          </div>

          {paymentType === 'due' && (
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-700">{formatCurrency(total)}</p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSubmit} disabled={items.length === 0} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ EXPENSE TRACKING ============
function ExpenseTracking() {
  const { expenses, addExpense, deleteExpense } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [formData, setFormData] = useState({ description: '', amount: '', category: '' });

  const filterExpenses = () => {
    const now = new Date();
    let start: Date, end: Date;
    switch (dateFilter) {
      case 'today': start = startOfDay(now); end = endOfDay(now); break;
      case 'week': start = startOfWeek(now); end = endOfWeek(now); break;
      case 'month': start = startOfMonth(now); end = endOfMonth(now); break;
      default: return expenses;
    }
    return expenses.filter(e => isWithinInterval(new Date(e.createdAt), { start, end }));
  };

  const filteredExpenses = filterExpenses().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    addExpense({ description: formData.description, amount: parseFloat(formData.amount), category: formData.category || 'General' });
    toast({ title: 'Success', description: 'Expense added' });
    setDialogOpen(false);
    setFormData({ description: '', amount: '', category: '' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <div className="flex gap-2 items-center">
          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm sm:text-lg font-medium">Total: <span className="text-red-500">{formatCurrency(totalExpenses)}</span></div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Expense
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No expenses found</TableCell></TableRow>
                ) : (
                  filteredExpenses.map(expense => (
                    <TableRow key={expense.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs">{format(new Date(expense.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-xs">{expense.description}</TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs">{expense.category || 'General'}</Badge></TableCell>
                      <TableCell className="text-xs text-right font-medium text-red-600">-{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(expense.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-lg">
          <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Description *</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>Amount (৳) *</Label><Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Rent, Utilities" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Expense?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteConfirm) { deleteExpense(deleteConfirm); toast({ title: 'Deleted', description: 'Expense deleted' }); setDeleteConfirm(null); } }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ REPORTS ============
function Reports() {
  const { sales, expenses, customers, duePayments } = useStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const today = new Date();

  const getChartData = () => {
    const data: { date: string; sales: number; expenses: number; profit: number }[] = [];
    if (period === 'daily') {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(today); hour.setHours(today.getHours() - i, 0, 0, 0);
        const hourEnd = new Date(hour); hourEnd.setHours(hour.getHours() + 1);
        const hourSales = sales.filter(s => isWithinInterval(new Date(s.createdAt), { start: hour, end: hourEnd })).reduce((sum, s) => sum + s.total, 0);
        const hourExpenses = expenses.filter(e => isWithinInterval(new Date(e.createdAt), { start: hour, end: hourEnd })).reduce((sum, e) => sum + e.amount, 0);
        data.push({ date: format(hour, 'h a'), sales: hourSales, expenses: hourExpenses, profit: hourSales - hourExpenses });
      }
    } else if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        const dayStart = startOfDay(day); const dayEnd = endOfDay(day);
        const daySales = sales.filter(s => isWithinInterval(new Date(s.createdAt), { start: dayStart, end: dayEnd })).reduce((sum, s) => sum + s.total, 0);
        const dayExpenses = expenses.filter(e => isWithinInterval(new Date(e.createdAt), { start: dayStart, end: dayEnd })).reduce((sum, e) => sum + e.amount, 0);
        data.push({ date: format(day, 'EEE'), sales: daySales, expenses: dayExpenses, profit: daySales - dayExpenses });
      }
    } else if (period === 'monthly') {
      for (let i = 29; i >= 0; i--) {
        const day = subDays(today, i);
        const dayStart = startOfDay(day); const dayEnd = endOfDay(day);
        const daySales = sales.filter(s => isWithinInterval(new Date(s.createdAt), { start: dayStart, end: dayEnd })).reduce((sum, s) => sum + s.total, 0);
        const dayExpenses = expenses.filter(e => isWithinInterval(new Date(e.createdAt), { start: dayStart, end: dayEnd })).reduce((sum, e) => sum + e.amount, 0);
        data.push({ date: format(day, 'MMM d'), sales: daySales, expenses: dayExpenses, profit: daySales - dayExpenses });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const month = subMonths(today, i);
        const monthStart = startOfMonth(month); const monthEnd = endOfMonth(month);
        const monthSales = sales.filter(s => isWithinInterval(new Date(s.createdAt), { start: monthStart, end: monthEnd })).reduce((sum, s) => sum + s.total, 0);
        const monthExpenses = expenses.filter(e => isWithinInterval(new Date(e.createdAt), { start: monthStart, end: monthEnd })).reduce((sum, e) => sum + e.amount, 0);
        data.push({ date: format(month, 'MMM'), sales: monthSales, expenses: monthExpenses, profit: monthSales - monthExpenses });
      }
    }
    return data;
  };

  const getPaymentData = () => {
    const cashTotal = sales.filter(s => s.paymentType === 'cash').reduce((sum, s) => sum + s.total, 0);
    const dueTotal = sales.filter(s => s.paymentType === 'due').reduce((sum, s) => sum + s.total, 0);
    return [{ name: 'Cash', value: cashTotal, color: COLORS[0] }, { name: 'Due', value: dueTotal, color: COLORS[1] }];
  };

  const getTopProducts = () => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  const getExpenseByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || 'General';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });
    return Object.entries(categoryTotals).map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }));
  };

  const chartData = getChartData();
  const paymentData = getPaymentData();
  const topProducts = getTopProducts();
  const expenseByCategory = getExpenseByCategory();

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDue = customers.reduce((sum, c) => {
    const customerDue = sales.filter(s => s.customerId === c.id && s.paymentType === 'due').reduce((s, sale) => s + sale.total, 0) -
      duePayments.filter(p => p.customerId === c.id).reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, customerDue);
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
          <Button key={p} variant={period === p ? 'default' : 'outline'} onClick={() => setPeriod(p)} className="capitalize text-xs sm:text-sm">{p}</Button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white shadow-md"><CardContent className="p-3 sm:p-6"><div className="text-xs text-gray-500">Total Revenue</div><div className="text-base sm:text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-red-50 to-white shadow-md"><CardContent className="p-3 sm:p-6"><div className="text-xs text-gray-500">Total Expenses</div><div className="text-base sm:text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-md"><CardContent className="p-3 sm:p-6"><div className="text-xs text-gray-500">Net Profit</div><div className={`text-base sm:text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-blue-700' : 'text-red-600'}`}>{formatCurrency(totalRevenue - totalExpenses)}</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white shadow-md"><CardContent className="p-3 sm:p-6"><div className="text-xs text-gray-500">Outstanding Dues</div><div className="text-base sm:text-2xl font-bold text-orange-700">{formatCurrency(totalDue)}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="p-3 sm:p-6"><CardTitle className="text-base sm:text-lg">Sales Trend</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff8042" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} width={45} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="expenses" stroke="#ff8042" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="p-3 sm:p-6"><CardTitle className="text-sm sm:text-base">Payment Distribution</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={60} dataKey="value">
                  {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="p-3 sm:p-6"><CardTitle className="text-sm sm:text-base">Expenses by Category</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {expenseByCategory.length === 0 ? <p className="text-gray-500 text-center py-8 text-sm">No expenses</p> : (
              <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                <RechartsBar data={expenseByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={45} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>{expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar>
                </RechartsBar>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="p-3 sm:p-6"><CardTitle className="text-sm sm:text-base">Top Selling Products</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {topProducts.length === 0 ? <p className="text-gray-500 text-center py-8 text-sm">No sales yet</p> : (
              <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                <RechartsBar data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" radius={[0, 4, 4, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ QUICK DIALOGS ============
function QuickSaleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <NewSaleDialog open={open} onClose={onClose} />;
}

function QuickProductDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addProduct } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    pricingType: 'fixed' as 'fixed' | 'weight',
    unit: 'pcs'
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      category: formData.category || 'General',
      pricingType: formData.pricingType,
      unit: formData.pricingType === 'weight' ? 'kg' : formData.unit,
    });
    toast({ title: 'Success', description: 'Product added' });
    onClose();
    setFormData({ name: '', price: '', stock: '', category: '', pricingType: 'fixed', unit: 'pcs' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-lg">
        <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div>
            <Label>Pricing Type *</Label>
            <Select value={formData.pricingType} onValueChange={(v: 'fixed' | 'weight') => setFormData({ ...formData, pricingType: v, unit: v === 'weight' ? 'kg' : 'pcs' })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="weight">Weight-Based (per kg)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price {formData.pricingType === 'weight' ? '(per kg) *' : '*'}</Label><Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
            <div><Label>Stock {formData.pricingType === 'weight' ? '(kg) *' : '*'}</Label><Input type="number" step="0.01" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} /></div>
          </div>
          <div><Label>Category</Label><Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-pink-600">Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuickExpenseDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExpense } = useStore();
  const [formData, setFormData] = useState({ description: '', amount: '', category: '' });

  const handleSubmit = () => {
    if (!formData.description || !formData.amount) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    addExpense({ description: formData.description, amount: parseFloat(formData.amount), category: formData.category || 'General' });
    toast({ title: 'Success', description: 'Expense added' });
    onClose();
    setFormData({ description: '', amount: '', category: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-lg">
        <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Description *</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div><Label>Amount (৳) *</Label><Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
