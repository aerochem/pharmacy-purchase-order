
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Send, 
  Download, 
  Plus, 
  Trash2, 
  Calculator,
  Building2,
  Package,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  PurchaseOrder, 
  PurchaseOrderItem, 
  Supplier, 
  Product, 
  DrugCategory, 
  GSTRate, 
  PurchaseOrderStatus,
  DRUG_CATEGORIES,
  PAYMENT_TERMS,
  GST_RATES
} from '@/lib/types';
import { 
  generateOrderNumber, 
  calculateGST, 
  calculateTotalWithGST, 
  formatCurrency 
} from '@/lib/utils';

export default function CreatePurchaseOrder() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>({
    orderNumber: generateOrderNumber(),
    supplierId: '',
    status: PurchaseOrderStatus.DRAFT,
    orderDate: new Date(),
    expectedDate: undefined,
    paymentTerms: '',
    comments: '',
    shippingAddress: 'SHED NO. D-99, BLOCK NO. 351 PAIKI 1, TULSI ESTATE AND PLAZA, CHANGODAR - 382220, TALUKA: SANAND, DISTRICT: AHMEDABAD-RURAL',
    subtotal: 0,
    totalGst: 0,
    totalAmount: 0,
    items: []
  });

  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    gstRate: GSTRate.GST_12,
    gstAmount: 0,
    totalAmount: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateOrderTotals();
  }, [purchaseOrder.items]);

  useEffect(() => {
    if (newItem.unitPrice && newItem.quantity && newItem.gstRate) {
      const subtotal = newItem.unitPrice * newItem.quantity;
      const gstAmount = calculateGST(subtotal, newItem.gstRate);
      const totalAmount = subtotal + gstAmount;
      
      setNewItem(prev => ({
        ...prev,
        gstAmount,
        totalAmount
      }));
    }
  }, [newItem.unitPrice, newItem.quantity, newItem.gstRate]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateOrderTotals = () => {
    const subtotal = purchaseOrder.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalGst = purchaseOrder.items.reduce((sum, item) => sum + item.gstAmount, 0);
    const totalAmount = subtotal + totalGst;

    setPurchaseOrder(prev => ({
      ...prev,
      subtotal,
      totalGst,
      totalAmount
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!purchaseOrder.supplierId) {
      newErrors.supplier = 'Please select a supplier';
    }

    if (purchaseOrder.items.length === 0) {
      newErrors.items = 'Please add at least one item';
    }

    // Check for duplicate products
    const productIds = purchaseOrder.items.map(item => item.productId);
    const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      newErrors.duplicates = 'Duplicate products are not allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || newItem.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate product
    if (purchaseOrder.items.some(item => item.productId === newItem.productId)) {
      toast({
        title: "Duplicate Product",
        description: "This product is already added to the order",
        variant: "destructive"
      });
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) return;

    const item: PurchaseOrderItem = {
      productId: newItem.productId!,
      product,
      quantity: newItem.quantity!,
      unitPrice: newItem.unitPrice || product.unitPrice,
      gstRate: newItem.gstRate!,
      gstAmount: newItem.gstAmount!,
      totalAmount: newItem.totalAmount!,
      notes: newItem.notes
    };

    setPurchaseOrder(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    // Reset new item form
    setNewItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      gstRate: GSTRate.GST_12,
      gstAmount: 0,
      totalAmount: 0,
      notes: ''
    });
  };

  const removeItem = (index: number) => {
    setPurchaseOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewItem(prev => ({
        ...prev,
        productId,
        unitPrice: product.unitPrice,
        gstRate: product.gstRate
      }));
    }
  };

  const saveDraft = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...purchaseOrder,
          status: PurchaseOrderStatus.DRAFT
        })
      });

      if (response.ok) {
        toast({
          title: "Draft Saved",
          description: "Purchase order draft has been saved successfully"
        });
        router.push('/');
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...purchaseOrder,
          status: PurchaseOrderStatus.SUBMITTED
        })
      });

      if (response.ok) {
        toast({
          title: "Order Submitted",
          description: "Purchase order has been submitted successfully"
        });
        router.push('/');
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/purchase-orders/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseOrder)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PO_${purchaseOrder.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Purchase Order</h1>
            <p className="text-gray-600 mt-2">
              Create a comprehensive pharmaceutical purchase order with GST calculations
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={saveDraft} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={submitOrder} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              Submit Order
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Order Information
                </CardTitle>
                <CardDescription>
                  Basic purchase order details and timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={purchaseOrder.orderNumber}
                      onChange={(e) => setPurchaseOrder(prev => ({ ...prev, orderNumber: e.target.value }))}
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderDate">Order Date</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={purchaseOrder.orderDate.toISOString().split('T')[0]}
                      onChange={(e) => setPurchaseOrder(prev => ({ ...prev, orderDate: new Date(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                    <Input
                      id="expectedDate"
                      type="date"
                      value={purchaseOrder.expectedDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setPurchaseOrder(prev => ({ 
                        ...prev, 
                        expectedDate: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={purchaseOrder.paymentTerms || ''}
                      onValueChange={(value) => setPurchaseOrder(prev => ({ ...prev, paymentTerms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(term => (
                          <SelectItem key={term} value={term}>{term}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Supplier Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Supplier Information
                </CardTitle>
                <CardDescription>
                  Select the supplier for this purchase order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={purchaseOrder.supplierId}
                    onValueChange={(value) => setPurchaseOrder(prev => ({ ...prev, supplierId: value }))}
                  >
                    <SelectTrigger className={errors.supplier ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier && (
                    <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Shipping Address
                </CardTitle>
                <CardDescription>
                  Delivery address for this purchase order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea
                    id="shippingAddress"
                    value={purchaseOrder.shippingAddress || ''}
                    onChange={(e) => setPurchaseOrder(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    placeholder="Enter shipping address..."
                    rows={3}
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Add Products
                </CardTitle>
                <CardDescription>
                  Add pharmaceutical products to your purchase order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="product">Product *</Label>
                    <Select
                      value={newItem.productId || ''}
                      onValueChange={handleProductSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.composition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={newItem.unitPrice || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstRate">GST Rate</Label>
                    <Select
                      value={newItem.gstRate || GSTRate.GST_12}
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, gstRate: value as GSTRate }))}
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
                    <Label>GST Amount</Label>
                    <Input
                      value={formatCurrency(newItem.gstAmount || 0)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <Input
                      value={formatCurrency(newItem.totalAmount || 0)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newItem.notes || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes for this item"
                  />
                </div>
                <Button onClick={addItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
                {errors.items && (
                  <p className="text-sm text-red-500">{errors.items}</p>
                )}
                {errors.duplicates && (
                  <p className="text-sm text-red-500">{errors.duplicates}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Items */}
          {purchaseOrder.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    Review and manage items in your purchase order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600">{item.product?.composition}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>Qty: {item.quantity}</span>
                            <span>Rate: {formatCurrency(item.unitPrice)}</span>
                            <span>GST: {GST_RATES[item.gstRate]}%</span>
                            <span className="font-medium">Total: {formatCurrency(item.totalAmount)}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Comments & Notes</CardTitle>
                <CardDescription>
                  Additional information for this purchase order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={purchaseOrder.comments || ''}
                  onChange={(e) => setPurchaseOrder(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Enter any additional comments or special instructions..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  GST calculations and total amounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>{purchaseOrder.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(purchaseOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total GST:</span>
                    <span>{formatCurrency(purchaseOrder.totalGst)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(purchaseOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* GST Breakdown */}
                {purchaseOrder.items.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-3">GST Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(
                        purchaseOrder.items.reduce((acc, item) => {
                          const rate = GST_RATES[item.gstRate];
                          if (!acc[rate]) acc[rate] = 0;
                          acc[rate] += item.gstAmount;
                          return acc;
                        }, {} as Record<number, number>)
                      ).map(([rate, amount]) => (
                        <div key={rate} className="flex justify-between">
                          <span>GST @ {rate}%:</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
