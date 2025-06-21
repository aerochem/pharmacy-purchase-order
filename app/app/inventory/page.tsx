
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Product, DRUG_CATEGORIES } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface InventoryProduct extends Product {
  stockStatus: 'normal' | 'low' | 'out';
  stockPercentage: number;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory?category=${categoryFilter}&stockStatus=${stockFilter}&search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (products: InventoryProduct[]) => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockStatus === 'low').length;
    const outOfStockProducts = products.filter(p => p.stockStatus === 'out').length;
    const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

    setStats({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    });
  };

  const applyFilters = () => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.stockStatus === 'low';
      } else if (stockFilter === 'out') {
        matchesStock = product.stockStatus === 'out';
      } else if (stockFilter === 'normal') {
        matchesStock = product.stockStatus === 'normal';
      }

      return matchesSearch && matchesCategory && matchesStock;
    });

    setFilteredProducts(filtered);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out':
        return 'bg-red-500 text-white';
      case 'low':
        return 'bg-yellow-500 text-white';
      case 'normal':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'out':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <TrendingDown className="h-4 w-4" />;
      case 'normal':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const exportInventory = () => {
    const csvContent = [
      ['Product Name', 'Generic Name', 'Composition', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Unit Price', 'Total Value', 'Status'].join(','),
      ...filteredProducts.map(product => [
        product.name,
        product.genericName || '',
        product.composition,
        product.category,
        product.currentStock,
        product.minStockLevel,
        product.maxStockLevel,
        product.unitPrice,
        product.currentStock * product.unitPrice,
        product.stockStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Real-time stock levels and inventory management
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={exportInventory}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={fetchInventory} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            title: 'Low Stock Items',
            value: stats.lowStockProducts,
            icon: TrendingDown,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
          },
          {
            title: 'Out of Stock',
            value: stats.outOfStockProducts,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
          },
          {
            title: 'Total Inventory Value',
            value: formatCurrency(stats.totalValue),
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DRUG_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="normal">Normal Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                {filteredProducts.length} of {products.length} products
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Inventory Details</CardTitle>
            <CardDescription>
              Detailed view of all products with stock levels and values
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' 
                    ? 'No products match your search criteria.' 
                    : 'No products in inventory.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Current Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Min Level</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Stock Level</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Value</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.composition}</p>
                            {product.manufacturer && (
                              <p className="text-xs text-gray-500">{product.manufacturer}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${
                            product.currentStock === 0 ? 'text-red-600' :
                            product.currentStock <= product.minStockLevel ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {product.currentStock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {product.minStockLevel}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={product.stockPercentage} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-gray-600 w-10">
                              {product.stockPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {formatCurrency(product.unitPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatCurrency(product.currentStock * product.unitPrice)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStockStatusColor(product.stockStatus)}>
                            <span className="flex items-center space-x-1">
                              {getStockStatusIcon(product.stockStatus)}
                              <span className="capitalize">{product.stockStatus}</span>
                            </span>
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
