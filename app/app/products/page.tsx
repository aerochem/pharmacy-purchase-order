
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  AlertTriangle,
  Calendar,
  DollarSign,
  Filter,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Product, DrugCategory, GSTRate, DRUG_CATEGORIES } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    composition: '',
    category: DrugCategory.TABLET,
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    unitPrice: '',
    gstRate: GSTRate.GST_12,
    hsnCode: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.currentStock <= product.minStockLevel;
      } else if (stockFilter === 'out') {
        matchesStock = product.currentStock === 0;
      } else if (stockFilter === 'normal') {
        matchesStock = product.currentStock > product.minStockLevel;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      composition: '',
      category: DrugCategory.TABLET,
      manufacturer: '',
      batchNumber: '',
      expiryDate: '',
      unitPrice: '',
      gstRate: GSTRate.GST_12,
      hsnCode: '',
      currentStock: '',
      minStockLevel: '10',
      maxStockLevel: '1000',
      isActive: true
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${editingProduct ? 'updated' : 'created'} successfully`
        });
        setIsDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? 'update' : 'create'} product`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      genericName: product.genericName || '',
      composition: product.composition,
      category: product.category,
      manufacturer: product.manufacturer || '',
      batchNumber: product.batchNumber || '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      unitPrice: product.unitPrice.toString(),
      gstRate: product.gstRate,
      hsnCode: product.hsnCode || '',
      currentStock: product.currentStock.toString(),
      minStockLevel: product.minStockLevel.toString(),
      maxStockLevel: product.maxStockLevel.toString(),
      isActive: product.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully"
        });
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return { status: 'Out of Stock', color: 'bg-red-500' };
    if (product.currentStock <= product.minStockLevel) return { status: 'Low Stock', color: 'bg-yellow-500' };
    return { status: 'In Stock', color: 'bg-green-500' };
  };

  const isExpiringSoon = (expiryDate: Date | undefined) => {
    if (!expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow;
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-2">
              Add, edit, and manage your pharmaceutical products with inventory tracking
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/products/bulk-upload'}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Update product information below.'
                    : 'Enter the details for the new product below.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="genericName">Generic Name</Label>
                    <Input
                      id="genericName"
                      value={formData.genericName}
                      onChange={(e) => setFormData(prev => ({ ...prev, genericName: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="composition">Composition *</Label>
                    <Input
                      id="composition"
                      value={formData.composition}
                      onChange={(e) => setFormData(prev => ({ ...prev, composition: e.target.value }))}
                      placeholder="e.g., Paracetamol 500mg, Caffeine 65mg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as DrugCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DRUG_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstRate">GST Rate *</Label>
                    <Select
                      value={formData.gstRate}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gstRate: value as GSTRate }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GSTRate.GST_5}>5% GST</SelectItem>
                        <SelectItem value={GSTRate.GST_12}>12% GST</SelectItem>
                        <SelectItem value={GSTRate.GST_18}>18% GST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hsnCode">HSN Code</Label>
                    <Input
                      id="hsnCode"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, hsnCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      value={formData.maxStockLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' 
                  ? 'No products match your search criteria.' 
                  : 'Get started by adding your first product.'}
              </p>
              {!searchTerm && categoryFilter === 'all' && stockFilter === 'all' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => {
              const stockStatus = getStockStatus(product);
              const expiringSoon = isExpiringSoon(product.expiryDate);
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.genericName && (
                            <CardDescription>{product.genericName}</CardDescription>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{product.composition}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${stockStatus.color}`} title={stockStatus.status} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <p className="font-medium">{product.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <p className="font-medium">{formatCurrency(product.unitPrice)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Stock:</span>
                          <p className={`font-medium ${product.currentStock <= product.minStockLevel ? 'text-red-600' : 'text-green-600'}`}>
                            {product.currentStock} units
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Min Level:</span>
                          <p className="font-medium">{product.minStockLevel}</p>
                        </div>
                      </div>
                      
                      {product.manufacturer && (
                        <div className="text-sm">
                          <span className="text-gray-600">Manufacturer:</span>
                          <p className="font-medium">{product.manufacturer}</p>
                        </div>
                      )}
                      
                      {product.expiryDate && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className={expiringSoon ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            Expires: {new Date(product.expiryDate).toLocaleDateString()}
                          </span>
                          {expiringSoon && <AlertTriangle className="h-4 w-4 ml-1 text-red-600" />}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-4">
                        <div className="text-sm text-gray-600">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${stockStatus.color}`} />
                          {stockStatus.status}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
