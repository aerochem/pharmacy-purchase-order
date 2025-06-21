
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Download,
  Edit,
  Calendar,
  Building2,
  Package,
  FileText,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrder, PurchaseOrderStatus, GST_RATES } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ViewPurchaseOrder() {
  const params = useParams();
  const { toast } = useToast();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder(params.id as string);
    }
  }, [params.id]);

  const fetchPurchaseOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrder({
          ...data,
          orderDate: new Date(data.orderDate),
          expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined
        });
      } else {
        toast({
          title: "Error",
          description: "Purchase order not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!purchaseOrder) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your purchase order PDF...",
      });

      const response = await fetch('/api/purchase-orders/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseOrder)
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          // Get HTML content and open in new window for printing
          const htmlContent = await response.text();
          
          // Create a new window with the HTML content
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Wait for content to load then trigger print
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                // Close window after printing (user can cancel)
                printWindow.onafterprint = () => {
                  printWindow.close();
                };
              }, 500);
            };
            
            toast({
              title: "PDF Ready",
              description: "Print dialog opened. You can save as PDF from the print options.",
            });
          } else {
            throw new Error('Unable to open print window. Please check popup blockers.');
          }
        } else if (contentType && contentType.includes('application/pdf')) {
          // Handle actual PDF response (fallback)
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `PO_${purchaseOrder.orderNumber}.pdf`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          toast({
            title: "Success",
            description: "PDF downloaded successfully!",
          });
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case PurchaseOrderStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case PurchaseOrderStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case PurchaseOrderStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case PurchaseOrderStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      case PurchaseOrderStatus.CANCELLED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase order...</p>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase order not found</h3>
        <p className="text-gray-600 mb-4">The requested purchase order could not be found.</p>
        <Link href="/purchase-orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/purchase-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Order Details</h1>
              <p className="text-gray-600 mt-2">
                View complete details for {purchaseOrder.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {(purchaseOrder.status === PurchaseOrderStatus.DRAFT || purchaseOrder.status === PurchaseOrderStatus.SUBMITTED) && (
              <Link href={`/purchase-orders/${purchaseOrder.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Order Information
                    </CardTitle>
                    <CardDescription>
                      Basic purchase order details and timeline
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(purchaseOrder.status)}>
                    {purchaseOrder.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Number</label>
                      <p className="text-lg font-semibold">{purchaseOrder.orderNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Date</label>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(purchaseOrder.orderDate)}
                      </p>
                    </div>
                    {purchaseOrder.expectedDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Expected Delivery</label>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(purchaseOrder.expectedDate)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                      <p>{purchaseOrder.paymentTerms || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Items</label>
                      <p className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        {purchaseOrder.items?.length || 0} items
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Value</label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(purchaseOrder.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Supplier Information */}
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
                  Details about the selected supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchaseOrder.supplier ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Supplier Name</label>
                        <p className="font-semibold">{purchaseOrder.supplier.name}</p>
                      </div>
                      {purchaseOrder.supplier.contactPerson && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Contact Person</label>
                          <p>{purchaseOrder.supplier.contactPerson}</p>
                        </div>
                      )}
                      {purchaseOrder.supplier.gstNumber && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">GST Number</label>
                          <p className="font-mono text-sm">{purchaseOrder.supplier.gstNumber}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {purchaseOrder.supplier.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p>{purchaseOrder.supplier.email}</p>
                        </div>
                      )}
                      {purchaseOrder.supplier.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <p>{purchaseOrder.supplier.phone}</p>
                        </div>
                      )}
                      {purchaseOrder.supplier.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Address</label>
                          <p className="text-sm">{purchaseOrder.supplier.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No supplier information available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Detailed list of all items in this purchase order
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {purchaseOrder.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.product?.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.product?.composition}</p>
                            {item.product?.genericName && (
                              <p className="text-sm text-gray-500">Generic: {item.product.genericName}</p>
                            )}
                            {item.product?.manufacturer && (
                              <p className="text-sm text-gray-500">Manufacturer: {item.product.manufacturer}</p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-blue-600 mt-2">
                                <strong>Note:</strong> {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <Badge variant="outline">{item.product?.category}</Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Quantity</label>
                            <p className="font-semibold">{item.quantity}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Unit Price</label>
                            <p>{formatCurrency(item.unitPrice)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">GST Rate</label>
                            <p>{GST_RATES[item.gstRate]}%</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">GST Amount</label>
                            <p>{formatCurrency(item.gstAmount)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Total Amount</label>
                            <p className="font-semibold text-green-600">{formatCurrency(item.totalAmount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No items in this order</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments */}
          {purchaseOrder.comments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Comments & Notes</CardTitle>
                  <CardDescription>
                    Additional information for this purchase order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{purchaseOrder.comments}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
                    <span>{purchaseOrder.items?.length || 0}</span>
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
                      <span className="text-green-600">{formatCurrency(purchaseOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* GST Breakdown */}
                {purchaseOrder.items && purchaseOrder.items.length > 0 && (
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
